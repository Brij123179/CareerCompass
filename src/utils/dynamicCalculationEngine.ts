import { Career, DimensionScores, Dimension, MarketRegion } from '../types';
import { DIMENSION_LABELS, MAX_DIMENSION_SCORES } from './scoringEngine';
import { LaborMarketService, REGIONAL_MARKETS } from './laborMarketService';

export interface DynamicSalaryBreakdown {
  baseSalary: number;
  marketMedian: number;
  candidateProjected: number;
  bonusProjected: number;
  equityProjected: number;
  totalComp: number;
  percentile: number;
  currencySymbol: string;
  formattedCandidate: string;
  formattedRange: string;
  formattedTotalComp: string;
  regionalMultiplier: number;
  experienceTier: 'Associate / Junior' | 'Mid-Level' | 'Senior' | 'Lead / Staff';
  rationale: string;
}

export interface DynamicSkillInsight {
  dimension: Dimension;
  label: string;
  userScore: number;
  maxScore: number;
  userRatio: number;
  requiredWeight: number;
  benchmarkRatio: number;
  deltaPercent: number; // positive = strength, negative = gap
  status: 'Mastery' | 'Competitive' | 'Developing' | 'Critical Gap';
  impactRoi: number; // Projected % increase in overall score if boosted
  recommendedAction: string;
}

export interface DynamicRoadmapPhase {
  step: number;
  phase: string;
  title: string;
  baseDuration: string;
  adjustedDuration: string;
  status: 'Fast-Tracked' | 'In Progress' | 'Upcoming';
  competencies: string[];
  recommendedProject: string;
  accelerationReason?: string;
}

export interface DynamicProfileMetrics {
  statisticalConfidence: number; // 0 - 100% calculated
  entropyScore: number;
  dimensionsAssessed: number;
  primaryStrength: string;
  secondaryStrength: string;
  primaryGap: string;
  estimatedTimeToJobReady: string; // e.g. "4.5 Months" based on score
}

/**
 * 1. DYNAMIC SALARY CALCULATION ENGINE
 * Calculates real market compensation based on:
 * - Career domain base band
 * - Candidate match score & technical depth (determines percentile within band)
 * - Regional cost-of-labor multiplier
 */
export function calculateDynamicSalary(
  career: Career,
  userScores: DimensionScores,
  matchScore: number,
  region: MarketRegion = LaborMarketService.getActiveRegion()
): DynamicSalaryBreakdown {
  const regionInfo = REGIONAL_MARKETS[region] || REGIONAL_MARKETS['us-tier1'];
  
  // Extract base numerical salary from career definition
  const rawBase = parseInt(career.comparison.avgSalary.replace(/[^0-9]/g, '')) || 115000;
  
  // Domain tier factor (e.g. AI & Cloud have higher compensation bands)
  let domainFactor = 1.0;
  if (career.category === 'Data & AI' || career.id.includes('ai') || career.id.includes('cloud')) {
    domainFactor = 1.12;
  } else if (career.category === 'Security & Cloud' || career.id.includes('cyber')) {
    domainFactor = 1.08;
  } else if (career.category === 'Engineering') {
    domainFactor = 1.04;
  }

  // Calculate technical / competency depth (0.0 to 1.0)
  const techDepth = ((userScores.technical || 20) + (userScores.problemSolving || 20)) / 
    ((MAX_DIMENSION_SCORES.technical || 45) + (MAX_DIMENSION_SCORES.problemSolving || 45));
  
  // Match score determines percentile position (from 40th percentile to 95th percentile)
  const percentile = Math.min(96, Math.max(35, Math.round(matchScore * 0.95 + techDepth * 10)));
  
  // Experience tier derived from scores
  let experienceTier: 'Associate / Junior' | 'Mid-Level' | 'Senior' | 'Lead / Staff' = 'Mid-Level';
  let tierMultiplier = 1.0;
  if (percentile >= 88) {
    experienceTier = 'Lead / Staff';
    tierMultiplier = 1.28;
  } else if (percentile >= 74) {
    experienceTier = 'Senior';
    tierMultiplier = 1.12;
  } else if (percentile >= 55) {
    experienceTier = 'Mid-Level';
    tierMultiplier = 0.95;
  } else {
    experienceTier = 'Associate / Junior';
    tierMultiplier = 0.80;
  }

  // Compute final localized compensation numbers
  const localizedBase = Math.round(rawBase * domainFactor * regionInfo.salaryMultiplier);
  const candidateBase = Math.round(localizedBase * tierMultiplier * (0.85 + (percentile / 100) * 0.3));
  const minRange = Math.round(localizedBase * 0.82);
  const maxRange = Math.round(localizedBase * 1.35);
  
  // Variable bonus & equity computation
  const bonusRate = percentile >= 85 ? 0.15 : percentile >= 70 ? 0.10 : 0.05;
  const bonusProjected = Math.round(candidateBase * bonusRate);
  
  const equityRate = (career.category === 'Engineering' || career.category === 'Data & AI') 
    ? (percentile >= 85 ? 0.22 : 0.12) 
    : 0.08;
  const equityProjected = Math.round(candidateBase * equityRate);
  
  const totalComp = candidateBase + bonusProjected + equityProjected;

  // Format currency
  const formatVal = (val: number) => {
    if (region === 'apac') {
      return `₹${(val / 100000).toFixed(1)}L - S$${Math.round(val / 75000)}k`;
    }
    return `${regionInfo.currencySymbol}${val.toLocaleString()}`;
  };

  const formattedCandidate = `${regionInfo.currencySymbol}${candidateBase.toLocaleString()}/yr`;
  const formattedRange = `${formatVal(minRange)} – ${formatVal(maxRange)}`;
  const formattedTotalComp = `${regionInfo.currencySymbol}${totalComp.toLocaleString()}/yr TC`;

  const rationale = `Based on your ${matchScore}% match score and assessed ${experienceTier} competency tier, you sit at the ${percentile}th market percentile for ${career.title} in ${regionInfo.label}.`;

  return {
    baseSalary: localizedBase,
    marketMedian: localizedBase,
    candidateProjected: candidateBase,
    bonusProjected,
    equityProjected,
    totalComp,
    percentile,
    currencySymbol: regionInfo.currencySymbol,
    formattedCandidate,
    formattedRange,
    formattedTotalComp,
    regionalMultiplier: regionInfo.salaryMultiplier,
    experienceTier,
    rationale
  };
}

/**
 * 2. DYNAMIC SKILL & GAP CALCULATION
 * Evaluates candidate scores against career dimensional weights, calculating:
 * - Mathematical strength/gap delta
 * - Projected score increase (ROI) for bridging each gap
 * - Custom actionable recommendations
 */
export function calculateDynamicSkills(
  career: Career,
  userScores: DimensionScores
): {
  strengths: DynamicSkillInsight[];
  growthGaps: DynamicSkillInsight[];
  allDimensions: DynamicSkillInsight[];
} {
  const dimensions = Object.keys(MAX_DIMENSION_SCORES) as Dimension[];

  const allDimensions: DynamicSkillInsight[] = dimensions.map(dim => {
    const userVal = userScores[dim] || 0;
    const maxVal = MAX_DIMENSION_SCORES[dim] || 45;
    const userRatio = userVal / maxVal;
    const reqWeight = career.dimensionalWeights[dim] || 3;
    const benchmarkRatio = (reqWeight / 5) * 0.85; // Benchmark threshold
    const deltaPercent = Math.round((userRatio - benchmarkRatio) * 100);

    // Calculate score ROI if candidate increases this dimension by 20%
    const currentNumerator = Object.keys(career.dimensionalWeights).reduce((sum, d) => {
      const dimKey = d as Dimension;
      return sum + (career.dimensionalWeights[dimKey] || 0) * (userScores[dimKey] || 0);
    }, 0);
    const denominator = Object.keys(career.dimensionalWeights).reduce((sum, d) => {
      const dimKey = d as Dimension;
      return sum + (career.dimensionalWeights[dimKey] || 0) * (MAX_DIMENSION_SCORES[dimKey] || 45);
    }, 0);

    const boostGain = reqWeight * (maxVal * 0.20);
    const projectedNewScore = Math.min(99, Math.round(((currentNumerator + boostGain) / (denominator || 1)) * 100));
    const currentScore = Math.round((currentNumerator / (denominator || 1)) * 100);
    const impactRoi = Math.max(2, projectedNewScore - currentScore);

    let status: 'Mastery' | 'Competitive' | 'Developing' | 'Critical Gap' = 'Competitive';

    if (deltaPercent >= 15) {
      status = 'Mastery';
    } else if (deltaPercent >= 0) {
      status = 'Competitive';
    } else if (deltaPercent >= -18) {
      status = 'Developing';
    } else {
      status = 'Critical Gap';
    }

    // Dynamic, discipline-specific actionable advice
    const getTailoredAction = (): string => {
      if (status === 'Mastery') {
        return `Exceptional surplus (+${deltaPercent}% vs benchmark). Anchor this as your primary interview differentiator and lead high-conviction architectural decisions.`;
      }
      if (status === 'Competitive') {
        return `Solid industry alignment (+${deltaPercent}% vs benchmark). Continue shipping production proof-of-work to convert this into verified mastery.`;
      }

      // Actionable advice for gaps based on dimension & career domain
      if (dim === 'technical') {
        if (career.category === 'Data & AI') {
          return `Build an inference pipeline utilizing PyTorch and vLLM with PagedAttention and FP8 quantization (+${impactRoi}% Match Gain).`;
        }
        if (career.category === 'Security & Cloud') {
          return `Deploy a hardened Kubernetes cluster with NetworkPolicies, RBAC, and automated Trivy vulnerability scanning (+${impactRoi}% Match Gain).`;
        }
        if (career.category === 'Design') {
          return `Build a live interactive component library in TypeScript/React with keyboard accessibility and fluid spring physics (+${impactRoi}% Match Gain).`;
        }
        return `Architect and benchmark an asynchronous event pipeline with Redis and Docker to prove production-ready concurrency (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'problemSolving') {
        if (career.category === 'Security & Cloud') {
          return `Tackle medium-difficulty CTF challenges on root-cause analysis, buffer overflows, and privilege escalation (+${impactRoi}% Match Gain).`;
        }
        if (career.category === 'Data & AI') {
          return `Tune high-dimensional hyperparameter search spaces and handle severe class imbalance with custom loss functions (+${impactRoi}% Match Gain).`;
        }
        return `Profile real-world latency bottlenecks under 500 RPS load, eliminate N+1 queries, and publish a performance teardown (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'data') {
        return `Design a high-concurrency transactional schema with composite indexes, partitioning, and sub-10ms query execution (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'analytical') {
        return `Construct an automated telemetry pipeline to quantify latency SLAs, error budgets, and MTTR across microservices (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'communication') {
        return `Author an RFC technical design document with sequence diagrams, failure mode analyses, and OpenAPI specs (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'creative') {
        return `Incorporate interactive 3D WebGL visualizations or fluid spring physics to elevate standard product UX (+${impactRoi}% Match Gain).`;
      }

      if (dim === 'leadership') {
        return `Organize and document an open-source technical sprint with PR review guidelines and automated CI checks (+${impactRoi}% Match Gain).`;
      }

      return `Conduct an algorithmic fairness and privacy audit ensuring GDPR/FERPA compliance and zero PII leakage (+${impactRoi}% Match Gain).`;
    };

    const recommendedAction = getTailoredAction();

    return {
      dimension: dim,
      label: DIMENSION_LABELS[dim],
      userScore: userVal,
      maxScore: maxVal,
      userRatio,
      requiredWeight: reqWeight,
      benchmarkRatio,
      deltaPercent,
      status,
      impactRoi,
      recommendedAction
    };
  });

  const strengths = allDimensions
    .filter(d => d.deltaPercent >= 0 && d.requiredWeight >= 3)
    .sort((a, b) => (b.deltaPercent * b.requiredWeight) - (a.deltaPercent * a.requiredWeight));

  const growthGaps = allDimensions
    .filter(d => d.deltaPercent < 0 && d.requiredWeight >= 3)
    .sort((a, b) => (a.deltaPercent - b.deltaPercent));

  return { strengths, growthGaps, allDimensions };
}

/**
 * 3. DYNAMIC ROADMAP & ACCELERATED CURRICULUM
 * Dynamically adjusts duration and milestones based on candidate's existing strengths
 */
export function calculateDynamicRoadmap(
  career: Career,
  userScores: DimensionScores
): {
  phases: DynamicRoadmapPhase[];
  totalEstimatedMonths: number;
  fastTrackedPhasesCount: number;
  customCapstone: string;
} {
  const techScore = userScores.technical || 20;
  const psScore = userScores.problemSolving || 20;
  const dataScore = userScores.data || 15;
  const creativeScore = userScores.creative || 15;

  let fastTrackCount = 0;
  let totalMonths = 0;

  const phases: DynamicRoadmapPhase[] = (career.roadmap || []).map((step, idx) => {
    // If step 1 (Foundation) and user has high baseline scores, fast-track it!
    const isStep1 = idx === 0;
    const isStep2 = idx === 1;

    let status: 'Fast-Tracked' | 'In Progress' | 'Upcoming' = 'Upcoming';
    let adjustedDuration = step.duration;
    let accelerationReason: string | undefined = undefined;

    if (isStep1) {
      if (techScore >= 28 && psScore >= 28) {
        status = 'Fast-Tracked';
        adjustedDuration = '2 - 3 Weeks (Accelerated)';
        accelerationReason = 'Assessed high technical & problem-solving scores bypass standard syntax foundation.';
        fastTrackCount++;
        totalMonths += 0.75;
      } else {
        status = 'In Progress';
        adjustedDuration = step.duration;
        totalMonths += 2.5;
      }
    } else if (isStep2) {
      if (techScore >= 34) {
        status = 'Fast-Tracked';
        adjustedDuration = '4 Weeks (Fast-Track)';
        accelerationReason = 'Demonstrated advanced component & architectural understanding.';
        fastTrackCount++;
        totalMonths += 1;
      } else {
        status = 'In Progress';
        adjustedDuration = step.duration;
        totalMonths += 3;
      }
    } else {
      totalMonths += 3;
    }

    return {
      step: step.step,
      phase: step.phase,
      title: step.title,
      baseDuration: step.duration,
      adjustedDuration,
      status,
      competencies: step.keySkills,
      recommendedProject: step.recommendedProject,
      accelerationReason
    };
  });

  // Dynamically tailor capstone project to user's strongest and weakest traits
  const weakest = (Object.keys(userScores) as Dimension[])
    .sort((a, b) => userScores[a] - userScores[b])[0];
  
  const customCapstone = `Deploy an end-to-end ${career.title} project with production CI/CD, specifically demonstrating ${DIMENSION_LABELS[weakest]} optimization and automated testing.`;

  return {
    phases,
    totalEstimatedMonths: Math.max(3, Math.round(totalMonths * 10) / 10),
    fastTrackedPhasesCount: fastTrackCount,
    customCapstone
  };
}

/**
 * 4. DYNAMIC STATISTICAL CONFIDENCE & ENTROPY
 * Calculates real mathematical confidence instead of a static "98.4% Confidence" badge
 */
export function calculateDynamicProfileMetrics(
  userScores: DimensionScores,
  matchScore: number
): DynamicProfileMetrics {
  const values = Object.values(userScores);
  const count = values.length || 1;
  const mean = values.reduce((acc, v) => acc + v, 0) / count;
  
  // Calculate variance across dimensions
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  // Confidence index:
  // - High when scores are distinct and strong (signal is clear)
  // - Decreases if scores are completely flat or erratic
  const signalClarity = Math.min(25, stdDev * 3);
  const baselineConfidence = 74;
  const statisticalConfidence = Math.min(99.2, Math.round((baselineConfidence + signalClarity + (matchScore * 0.12)) * 10) / 10);

  const sorted = (Object.keys(userScores) as Dimension[])
    .sort((a, b) => userScores[b] - userScores[a]);

  const primaryStrength = DIMENSION_LABELS[sorted[0]] || 'Problem Solving';
  const secondaryStrength = DIMENSION_LABELS[sorted[1]] || 'Analytical Thinking';
  const primaryGap = DIMENSION_LABELS[sorted[sorted.length - 1]] || 'Communication';

  // Job readiness estimate
  const estimatedMonths = Math.max(3, Math.round((100 - matchScore) * 0.25 * 10) / 10);
  const estimatedTimeToJobReady = `${estimatedMonths} Months`;

  return {
    statisticalConfidence,
    entropyScore: Math.round(variance * 10) / 10,
    dimensionsAssessed: count,
    primaryStrength,
    secondaryStrength,
    primaryGap,
    estimatedTimeToJobReady
  };
}

/**
 * 5. DYNAMIC GAMIFICATION METRICS
 * Computes live diamonds and XP dynamically from quiz activity
 */
export function calculateDynamicGamification(): {
  diamonds: number;
  xp: number;
  streakDays: number;
  level: number;
  levelTitle: string;
} {
  let diamonds = 50; // base welcome
  let xp = 150;
  let streakDays = 1;

  if (typeof window !== 'undefined') {
    try {
      const storedDiamonds = localStorage.getItem('careercompass_diamonds');
      const storedXp = localStorage.getItem('careercompass_xp');
      const storedStreak = localStorage.getItem('careercompass_streak');

      if (storedDiamonds) diamonds = parseInt(storedDiamonds, 10);
      if (storedXp) xp = parseInt(storedXp, 10);
      if (storedStreak) streakDays = parseInt(storedStreak, 10);
    } catch {
      // fallback
    }
  }

  const level = Math.floor(xp / 200) + 1;
  const levelTitles = ['Pathfinder Novice', 'Cognitive Explorer', 'Systems Apprentice', 'Senior Architect', 'Staff Visionary'];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  return { diamonds, xp, streakDays, level, levelTitle };
}

export interface DynamicSprintTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  deliverable: string;
  tags: string[];
}

/**
 * 6. DYNAMIC SPRINT TASKS PER CAREER
 * Automatically synthesizes sprint deliverables calibrated to the candidate's top career specialization
 */
export function generateDynamicSprintTasks(career: Career, userScores: DimensionScores): DynamicSprintTask[] {
  const cid = career?.id || 'fullstack-engineer';

  if (cid === 'ai-ml-engineer') {
    return [
      {
        id: 'task-1',
        title: 'Week 1: High-Dimensional Embeddings & Vector Search',
        description: 'Implement semantic indexing with pgvector/Qdrant and evaluate cosine similarity recall.',
        duration: '5 Days',
        deliverable: 'Sub-15ms vector retrieval service with hybrid keyword/dense search',
        tags: ['Embeddings', 'VectorDB', 'Python']
      },
      {
        id: 'task-2',
        title: 'Week 2: LoRA Fine-Tuning & Parameter Efficient Adaptation',
        description: 'Fine-tune an open-source 8B model using QLoRA on a specialized domain instruction dataset.',
        duration: '6 Days',
        deliverable: 'Quantized GGUF checkpoint with benchmark perplexity evaluation',
        tags: ['PyTorch', 'HuggingFace', 'LoRA']
      },
      {
        id: 'task-3',
        title: 'Week 3: Multi-Agent Orchestration & Tool Calling',
        description: 'Construct an autonomous agent workflow with deterministic guardrails and verification loops.',
        duration: '5 Days',
        deliverable: 'Self-correcting agent pipeline with structured JSON schema outputs',
        tags: ['Agents', 'LangGraph', 'Eval']
      },
      {
        id: 'task-4',
        title: 'Week 4: Model Serving, vLLM & Low-Latency Streaming',
        description: 'Deploy high-throughput inference with PagedAttention, KV-cache quantization, and streaming SSE.',
        duration: '4 Days',
        deliverable: 'vLLM Docker deployment with Prometheus token latency metrics',
        tags: ['vLLM', 'Inference', 'Docker']
      }
    ];
  }

  if (cid === 'ui-ux-designer') {
    return [
      {
        id: 'task-1',
        title: 'Week 1: Design Tokens & Scalable Design System',
        description: 'Establish typography scale, atomic color primitives, and component variables in Figma.',
        duration: '4 Days',
        deliverable: 'Multi-theme Figma design library with auto-layout v5 components',
        tags: ['Design Tokens', 'Figma', 'Typography']
      },
      {
        id: 'task-2',
        title: 'Week 2: Quantitative User Journey & Micro-Interactions',
        description: 'Design intuitive onboarding states, responsive layouts, and interactive spring physics animations.',
        duration: '5 Days',
        deliverable: 'High-fidelity interactive prototype tested with 5 real users',
        tags: ['Prototyping', 'Ergonomics', 'Usability']
      },
      {
        id: 'task-3',
        title: 'Week 3: WCAG 2.2 AA Accessibility & Screen-Reader Audit',
        description: 'Verify color contrast ratios, keyboard tab navigation rings, and ARIA landmarks.',
        duration: '4 Days',
        deliverable: 'Audited design documentation with 100% WCAG AA compliance certificate',
        tags: ['Accessibility', 'WCAG', 'Inclusion']
      },
      {
        id: 'task-4',
        title: 'Week 4: Design-to-Code Handoff & Component Architecture',
        description: 'Translate Figma tokens into reusable React/Tailwind/CSS custom property tokens.',
        duration: '5 Days',
        deliverable: 'Live Storybook documentation workspace for engineering teams',
        tags: ['Storybook', 'CSS', 'Engineering Handoff']
      }
    ];
  }

  if (cid === 'cybersecurity-analyst') {
    return [
      {
        id: 'task-1',
        title: 'Week 1: Threat Modeling & Zero-Trust Attack Surface Analysis',
        description: 'Conduct STRIDE threat modeling on cloud API gateways and map adversarial vectors via MITRE ATT&CK.',
        duration: '5 Days',
        deliverable: 'Comprehensive STRIDE threat matrix and remediation blueprint',
        tags: ['STRIDE', 'MITRE ATT&CK', 'Zero-Trust']
      },
      {
        id: 'task-2',
        title: 'Week 2: SIEM Pipeline & Automated Suricata Intrusion Detection',
        description: 'Ingest raw network packet captures, parse Syslog feeds, and configure alert correlation rules.',
        duration: '5 Days',
        deliverable: 'Live SIEM dashboard with automated brute-force and exfiltration alerts',
        tags: ['SIEM', 'Suricata', 'Telemetry']
      },
      {
        id: 'task-3',
        title: 'Week 3: Identity Governance & Hardware TOTP RFC 6238',
        description: 'Audit session tokens, implement cryptographic MFA challenges, and enforce least-privilege RBAC.',
        duration: '4 Days',
        deliverable: 'Hardened authentication gateway with salted hashes and TOTP validation',
        tags: ['Cryptography', 'RFC 6238', 'IAM']
      },
      {
        id: 'task-4',
        title: 'Week 4: Container Security, Vulnerability Scanning & SBOM',
        description: 'Scan Docker container images with Trivy, generate SPDX SBOMs, and enforce image signing with Cosign.',
        duration: '4 Days',
        deliverable: 'Zero-vulnerability CI/CD gate with signed container provenance',
        tags: ['Trivy', 'SBOM', 'Cosign']
      }
    ];
  }

  // Default Full Stack / Systems Architecture Sprints
  return [
    {
      id: 'task-1',
      title: 'Week 1: Core System Architecture & Microservices',
      description: 'Decompose monolithic business domains into decoupled services with explicit API contracts and data models.',
      duration: '5 Days',
      deliverable: 'Service architecture schema & OpenAPI 3.0 specification',
      tags: ['Architecture', 'REST/gRPC', 'Data Modeling']
    },
    {
      id: 'task-2',
      title: 'Week 2: High-Performance Database & Redis Caching',
      description: 'Optimize relational query execution plans, design composite indexing strategies, and implement cache-aside pattern.',
      duration: '4 Days',
      deliverable: 'Indexed database migration & sub-10ms Redis cache layer',
      tags: ['SQL', 'Redis', 'Performance']
    },
    {
      id: 'task-3',
      title: 'Week 3: Zero-Trust Security & Cryptographic MFA',
      description: 'Implement salted SHA-256 password hashing, RFC 6238 TOTP authentication tokens, and strict role-based access control.',
      duration: '5 Days',
      deliverable: 'Zero-trust auth gateway with live 30s rolling code validator',
      tags: ['Security', 'RFC 6238', 'RBAC']
    },
    {
      id: 'task-4',
      title: 'Week 4: Automated CI/CD, Containerization & Benchmarks',
      description: 'Construct multi-stage Docker builds, automated unit/integration test suites, and conduct load testing under 500 RPS.',
      duration: '4 Days',
      deliverable: 'GitHub Actions workflow & latency stress benchmark report',
      tags: ['Docker', 'CI/CD', 'Testing']
    }
  ];
}

export interface DynamicRecommendationCard {
  id: string;
  pillar: 'Tactical (14-Day Sprint)' | 'Unfair Advantage (Synthesis)' | 'Interview Storytelling';
  badge: string;
  badgeClass: string;
  title: string;
  impactGain: string;
  rationale: string;
  actionItems: string[];
}

/**
 * 7. DYNAMIC EXECUTIVE RECOMMENDATIONS
 * Computes 3 personalized strategic pillars based on exact strengths, worst deficit, and target role
 */
export function calculateDynamicRecommendations(
  career: Career,
  userScores: DimensionScores,
  matchScore: number
): DynamicRecommendationCard[] {
  const { strengths, growthGaps } = calculateDynamicSkills(career, userScores);
  const topStrength = strengths[0] || { label: 'Analytical Thinking', dimension: 'analytical', deltaPercent: 20 };
  const topGap = growthGaps[0] || { label: 'Technical Depth', dimension: 'technical', impactRoi: 8, recommendedAction: 'Build a production proof of concept' };

  // Pillar 1: Tactical 14-Day Sprint (Attacking the highest ROI deficit)
  const tacticalCard: DynamicRecommendationCard = {
    id: 'rec-tactical',
    pillar: 'Tactical (14-Day Sprint)',
    badge: `⚡ +${topGap.impactRoi}% SCORE SURGE`,
    badgeClass: 'badge-amber',
    title: `Close Priority Deficit: ${topGap.label}`,
    impactGain: `Instant +${topGap.impactRoi}% Match Surge`,
    rationale: `Your largest mathematically weighted gap for a ${career.title} is in ${topGap.label}. Eliminating this single bottleneck yields immediate hireability returns.`,
    actionItems: [
      topGap.recommendedAction,
      `Publish code walkthrough or architectural diagrams to your GitHub/Portfolio`,
      `Complete a timed mock technical challenge focusing specifically on this domain`
    ]
  };

  // Pillar 2: Unfair Advantage (Blending top strength with target career)
  const advantageCard: DynamicRecommendationCard = {
    id: 'rec-advantage',
    pillar: 'Unfair Advantage (Synthesis)',
    badge: '🏆 HYBRID POSITIONING',
    badgeClass: 'badge-emerald',
    title: `The ${topStrength.label}-Driven ${career.title}`,
    impactGain: 'Top 5% Candidate Differentiation',
    rationale: `Most candidates applying for ${career.title} present identical standard technical stacks. Your distinctive mastery in ${topStrength.label} (+${topStrength.deltaPercent}% over benchmark) is your unfair advantage.`,
    actionItems: [
      `Frame your portfolio projects around ${topStrength.label}: demonstrate how your mindset produces better architectures than pure code monkeying`,
      `Highlight cross-functional outcomes where your ${topStrength.label} prevented costly engineering rewrites`,
      `Add a case study explicitly showcasing decision-making under ambiguity`
    ]
  };

  // Pillar 3: Technical Interview Storytelling
  const interviewCard: DynamicRecommendationCard = {
    id: 'rec-interview',
    pillar: 'Interview Storytelling',
    badge: '🎯 RECRUITER BUY-IN',
    badgeClass: 'badge-indigo',
    title: `Narrative Strategy: Framing Your ${matchScore}% Compatibility`,
    impactGain: '85%+ Recruiter Callback Rate',
    rationale: `At a ${matchScore}% compatibility score, interviewers want to verify trajectory velocity and how quickly you overcome unfamiliar problem spaces.`,
    actionItems: [
      `In the "Tell me about a time" rounds: Anchor on how your ${topStrength.label} helped unblock a complex deadlock`,
      `Proactively acknowledge your ongoing growth in ${topGap.label} and show the exact 14-day study sprint you are executing`,
      `Request system design scenarios that allow you to sketch high-level contracts before diving into syntax`
    ]
  };

  return [tacticalCard, advantageCard, interviewCard];
}

