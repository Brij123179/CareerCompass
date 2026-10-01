import { Dimension, DimensionScores, Career, MatchBreakdown, SimulatorSkills } from '../types';
import { QUIZ_QUESTIONS } from '../data/questionsData';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  technical: 'Technical & Engineering',
  analytical: 'Analytical & Logic',
  creative: 'Creative & UI/UX',
  communication: 'Communication & Storytelling',
  leadership: 'Leadership & Strategy',
  problemSolving: 'Problem Solving & Troubleshooting',
  data: 'Data & Quantitative Insights',
  technology: 'Cloud & Modern Tech Stacks',
  socialImpact: 'Ethics & User/Social Impact'
};

// Compute theoretical maximum score possible for each dimension across the 12 questions
export function calculateMaxDimensionScores(): DimensionScores {
  const maxScores: DimensionScores = {
    technical: 0,
    analytical: 0,
    creative: 0,
    communication: 0,
    leadership: 0,
    problemSolving: 0,
    data: 0,
    technology: 0,
    socialImpact: 0
  };

  QUIZ_QUESTIONS.forEach(question => {
    (Object.keys(maxScores) as Dimension[]).forEach(dim => {
      let maxForThisQuestion = 0;
      question.options.forEach(opt => {
        const val = opt.weights[dim] || 0;
        if (val > maxForThisQuestion) {
          maxForThisQuestion = val;
        }
      });
      maxScores[dim] += maxForThisQuestion;
    });
  });

  // Ensure non-zero safe floor
  (Object.keys(maxScores) as Dimension[]).forEach(dim => {
    if (maxScores[dim] === 0) maxScores[dim] = 20;
  });

  return maxScores;
}

export const MAX_DIMENSION_SCORES = calculateMaxDimensionScores();

// Calculate user's aggregate raw dimensional scores from selected option IDs
export function calculateUserScoresFromAnswers(selectedOptionIds: Record<number, string>): DimensionScores {
  const scores: DimensionScores = {
    technical: 0,
    analytical: 0,
    creative: 0,
    communication: 0,
    leadership: 0,
    problemSolving: 0,
    data: 0,
    technology: 0,
    socialImpact: 0
  };

  QUIZ_QUESTIONS.forEach(q => {
    const chosenOptionId = selectedOptionIds[q.id];
    if (chosenOptionId) {
      const option = q.options.find(opt => opt.id === chosenOptionId);
      if (option) {
        (Object.keys(scores) as Dimension[]).forEach(dim => {
          scores[dim] += (option.weights[dim] || 0);
        });
      }
    }
  });

  return scores;
}

export const DEFAULT_CAREER_PREREQUISITES: Record<string, Partial<Record<Dimension, number>>> = {
  'ai-ml-engineer': { analytical: 0.60, technical: 0.50, data: 0.55 },
  'data-scientist': { analytical: 0.55, data: 0.60, problemSolving: 0.45 },
  'fullstack-engineer': { technical: 0.50, problemSolving: 0.50 },
  'cybersecurity-analyst': { problemSolving: 0.60, technical: 0.50, technology: 0.50 },
  'cloud-architect': { technical: 0.55, technology: 0.60, problemSolving: 0.50 },
  'ui-ux-designer': { creative: 0.60, communication: 0.45 },
  'tech-product-manager': { communication: 0.55, leadership: 0.50, problemSolving: 0.45 },
  'devops-engineer': { technical: 0.55, technology: 0.55, problemSolving: 0.45 },
  'blockchain-engineer': { technical: 0.60, problemSolving: 0.55, analytical: 0.50 },
  'ai-ethics-specialist': { socialImpact: 0.60, communication: 0.55 }
};

/**
 * Calculates raw linear weighted dot product and non-linear prerequisite gating penalties.
 * Deterministic Formula:
 * Raw Match % = round( ( \sum (w_{career, i} * s_{user, i}) ) / ( \sum (w_{career, i} * max(s_i)) ) * 100 )
 * Non-Linear Adjusted % = round( Raw Match % * \prod (1 - penalty_weight * deficit_k) )
 */
export function calculateCareerMatchDetails(
  career: Career,
  userScores: DimensionScores,
  maxScores: DimensionScores = MAX_DIMENSION_SCORES
): { score: number; rawLinearScore: number; nonlinearPenaltyPct: number; alerts: import('../types').PrerequisiteAlert[] } {
  let numerator = 0;
  let denominator = 0;

  const dimensions = Object.keys(career.dimensionalWeights) as Dimension[];

  dimensions.forEach(dim => {
    const w = career.dimensionalWeights[dim];
    const s = Math.min(userScores[dim] || 0, maxScores[dim]);
    const maxVal = maxScores[dim] || 1;

    numerator += w * s;
    denominator += w * maxVal;
  });

  if (denominator === 0) {
    return { score: 0, rawLinearScore: 0, nonlinearPenaltyPct: 0, alerts: [] };
  }

  // Normalized raw percentage
  const rawPercentage = (numerator / denominator) * 100;
  const rawGrounded = Math.round(Math.min(99, Math.max(30, rawPercentage)));

  // Non-linear prerequisite gates
  const prereqs = career.prerequisites || DEFAULT_CAREER_PREREQUISITES[career.id] || {};
  let penaltyMultiplier = 1.0;
  const alerts: import('../types').PrerequisiteAlert[] = [];

  (Object.keys(prereqs) as Dimension[]).forEach(dim => {
    const minThresholdPct = prereqs[dim] || 0.5;
    const actualScore = userScores[dim] || 0;
    const maxScore = maxScores[dim] || 1;
    const actualRatio = actualScore / maxScore;

    if (actualRatio < minThresholdPct) {
      const deficit = (minThresholdPct - actualRatio) / minThresholdPct;
      // Progressive graduated penalty (up to 20% deficit per gate)
      const penalty = Math.min(0.25, deficit * 0.35);
      penaltyMultiplier *= (1.0 - penalty);

      alerts.push({
        dimension: dim,
        label: DIMENSION_LABELS[dim],
        requiredThreshold: Math.round(minThresholdPct * 100),
        actualScore: Math.round(actualRatio * 100),
        deficitRatio: Math.round(deficit * 100),
        penaltyPercentage: Math.round(penalty * 100)
      });
    }
  });

  const penaltyPct = Math.round((1.0 - penaltyMultiplier) * 100);
  const finalScore = Math.round(Math.min(99, Math.max(25, rawGrounded * penaltyMultiplier)));

  return {
    score: finalScore,
    rawLinearScore: rawGrounded,
    nonlinearPenaltyPct: penaltyPct,
    alerts
  };
}

export function calculateCareerMatch(
  career: Career,
  userScores: DimensionScores,
  maxScores: DimensionScores = MAX_DIMENSION_SCORES
): number {
  return calculateCareerMatchDetails(career, userScores, maxScores).score;
}

/**
 * Calculates match percentage when using the What-If Simulator sliders (0 to 100 values)
 */
export function calculateSimulatorMatch(career: Career, simSkills: SimulatorSkills): number {
  // Map simulator skills (0-100) to full 9-dimension profile
  const syntheticScores: DimensionScores = {
    problemSolving: (simSkills.problemSolving / 100) * MAX_DIMENSION_SCORES.problemSolving,
    communication: (simSkills.communication / 100) * MAX_DIMENSION_SCORES.communication,
    technical: (simSkills.technical / 100) * MAX_DIMENSION_SCORES.technical,
    creative: (simSkills.creativity / 100) * MAX_DIMENSION_SCORES.creative,
    leadership: (simSkills.leadership / 100) * MAX_DIMENSION_SCORES.leadership,
    data: (simSkills.data / 100) * MAX_DIMENSION_SCORES.data,
    // Correlated secondary dimensions
    technology: ((simSkills.technical * 0.7 + simSkills.problemSolving * 0.3) / 100) * MAX_DIMENSION_SCORES.technology,
    analytical: ((simSkills.data * 0.6 + simSkills.problemSolving * 0.4) / 100) * MAX_DIMENSION_SCORES.analytical,
    socialImpact: ((simSkills.communication * 0.6 + simSkills.leadership * 0.4) / 100) * MAX_DIMENSION_SCORES.socialImpact,
  };

  return calculateCareerMatch(career, syntheticScores, MAX_DIMENSION_SCORES);
}

/**
 * Generates tailored "Why this matches" breakdown according to specifications
 */
export function generateMatchBreakdown(
  career: Career,
  userScores: DimensionScores,
  matchScore: number
): MatchBreakdown {
  const dimensions = Object.keys(userScores) as Dimension[];

  // Calculate percentage of max for each dimension
  const dimensionPercentages = dimensions.map(dim => ({
    dimension: dim,
    label: DIMENSION_LABELS[dim],
    score: userScores[dim],
    max: MAX_DIMENSION_SCORES[dim],
    pct: (userScores[dim] / (MAX_DIMENSION_SCORES[dim] || 1)),
    careerWeight: career.dimensionalWeights[dim]
  }));

  // Sort user top strengths
  const sortedByPct = [...dimensionPercentages].sort((a, b) => b.pct - a.pct);
  const userAttributesMatched = sortedByPct
    .filter(d => d.careerWeight >= 4)
    .slice(0, 3)
    .map(d => d.label);

  // "Skills you already show" (high user score & high career weight)
  const skillsAlreadyShow = dimensionPercentages
    .filter(d => d.pct >= 0.55 && d.careerWeight >= 3)
    .sort((a, b) => (b.careerWeight * b.pct) - (a.careerWeight * a.pct))
    .slice(0, 4)
    .map(d => ({
      dimension: d.dimension,
      label: d.label,
      score: d.score,
      max: d.max
    }));

  // "Skills you can develop" (career expects high proficiency, user has room for growth)
  const skillsCanDevelop = dimensionPercentages
    .filter(d => d.careerWeight >= 4 && d.pct < 0.75)
    .sort((a, b) => b.careerWeight - a.careerWeight)
    .slice(0, 3)
    .map(d => ({
      dimension: d.dimension,
      label: d.label,
      userScore: Math.round(d.pct * 100),
      requiredWeight: d.careerWeight
    }));

  // If skillsCanDevelop is empty because user scored super high, offer high-weight dimensions as mastery targets
  if (skillsCanDevelop.length === 0) {
    dimensionPercentages
      .filter(d => d.careerWeight >= 4)
      .slice(0, 2)
      .forEach(d => {
        skillsCanDevelop.push({
          dimension: d.dimension,
          label: d.label + ' (Advanced Mastery)',
          userScore: Math.round(d.pct * 100),
          requiredWeight: d.careerWeight
        });
      });
  }

  // Tailored, career-specific rationale narrative based on specific career requirements
  const careerWeightedStrengths = dimensionPercentages
    .filter(d => d.careerWeight >= 3)
    .sort((a, b) => (b.pct * b.careerWeight) - (a.pct * a.careerWeight));

  const primaryStrength = careerWeightedStrengths[0]?.label || sortedByPct[0]?.label || 'analytical problem solving';
  const secondaryStrength = careerWeightedStrengths[1]?.label || sortedByPct[1]?.label || 'strategic thinking';

  // Specific domain narratives per career category
  const categoryHighlights: Record<string, string> = {
    'Software Engineering': `Your strong grasp of ${primaryStrength} gives you the computational intuition to design scalable backend architectures and robust systems.`,
    'Artificial Intelligence': `Your profile in ${primaryStrength} combined with ${secondaryStrength} aligns directly with training predictive models, handling high-dimensional data, and LLM orchestration.`,
    'Data Science & Analytics': `Your sharp competency in ${primaryStrength} empowers you to extract high-leverage business signals from complex multi-source telemetry.`,
    'Design & Creative Tech': `Your balance of ${primaryStrength} and empathy makes you adept at translating complex user workflows into intuitive, elegant interfaces.`,
    'Cybersecurity': `Your vigilant focus on ${primaryStrength} and ${secondaryStrength} matches the threat-modeling and zero-trust engineering required in modern SecOps.`,
    'Cloud & Infrastructure': `Your proficiency in ${primaryStrength} provides the systems-level perspective required to engineer self-healing, multi-region cloud infrastructure.`,
    'Product & Management': `Your natural flair for ${primaryStrength} and ${secondaryStrength} uniquely equips you to define high-conviction product roadmaps and unite engineering teams.`,
    'DevOps & SRE': `Your emphasis on ${primaryStrength} enables automated CI/CD pipelines, container orchestration, and sub-second incident resolution.`,
    'Business & Strategy': `Your command of ${primaryStrength} bridges technical implementation with executive monetization and revenue metrics.`,
    'Creative & Emerging Tech': `Your creative experimentation with ${primaryStrength} matches interactive 3D shader design and next-gen spatial computing.`,
    'Tech Governance & Privacy': `Your acute sense of ${primaryStrength} and ${secondaryStrength} makes you an essential guardian for AI compliance, digital rights, and data governance.`
  };

  const domainNarrative = categoryHighlights[career.category] || 
    `Your aptitude in ${primaryStrength} and ${secondaryStrength} strongly aligns with the daily problem space of a ${career.title}.`;

  let rationale = `${domainNarrative} `;
  
  if (matchScore >= 85) {
    rationale += `You demonstrate exceptional foundational alignment with this discipline's highest-weight dimensions.`;
  } else if (matchScore >= 70) {
    rationale += `You hold a strong baseline; targeted boost in ${skillsCanDevelop[0]?.label || 'core competencies'} can rapidly propel you to top-tier roles.`;
  } else {
    rationale += `While this is a cross-disciplinary path, your unique strengths provide versatile advantages in hybrid team roles.`;
  }

  // Calculate detailed match breakdown with non-linear penalties
  const details = calculateCareerMatchDetails(career, userScores);
  const effectiveScore = matchScore ?? details.score;

  return {
    score: effectiveScore,
    rawLinearScore: details.rawLinearScore,
    nonlinearPenaltyPct: details.nonlinearPenaltyPct,
    prerequisiteAlerts: details.alerts,
    career,
    userAttributesMatched,
    skillsAlreadyShow,
    skillsCanDevelop,
    rationale
  };
}

// Generate a realistic default profile for instant preview
export const DEFAULT_USER_SCORES: DimensionScores = {
  technical: Math.round(MAX_DIMENSION_SCORES.technical * 0.78),
  analytical: Math.round(MAX_DIMENSION_SCORES.analytical * 0.85),
  creative: Math.round(MAX_DIMENSION_SCORES.creative * 0.65),
  communication: Math.round(MAX_DIMENSION_SCORES.communication * 0.70),
  leadership: Math.round(MAX_DIMENSION_SCORES.leadership * 0.60),
  problemSolving: Math.round(MAX_DIMENSION_SCORES.problemSolving * 0.88),
  data: Math.round(MAX_DIMENSION_SCORES.data * 0.82),
  technology: Math.round(MAX_DIMENSION_SCORES.technology * 0.80),
  socialImpact: Math.round(MAX_DIMENSION_SCORES.socialImpact * 0.60)
};

export const DEFAULT_SIMULATOR_SKILLS: SimulatorSkills = {
  problemSolving: 85,
  communication: 70,
  technical: 80,
  creativity: 65,
  leadership: 60,
  data: 82
};
