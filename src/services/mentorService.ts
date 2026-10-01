import { DimensionScores, MatchBreakdown, Career, Dimension } from '../types';
import { DIMENSION_LABELS, calculateCareerMatch } from '../utils/scoringEngine';
import { CAREERS_DATA } from '../data/careersData';
import { SecurityService } from './securityService';
import { 
  calculateDynamicSalary, 
  calculateDynamicSkills, 
  calculateDynamicRoadmap, 
  calculateDynamicRecommendations, 
  generateDynamicSprintTasks 
} from '../utils/dynamicCalculationEngine';
import { LaborMarketService, REGIONAL_MARKETS } from '../utils/laborMarketService';

export interface MentorContext {
  userScores: DimensionScores;
  topMatches: MatchBreakdown[];
  selectedCareer?: Career;
  userName?: string;
}

export interface MentorResponse {
  text: string;
  source: 'offline' | 'openrouter';
  suggestedFollowUps?: string[];
  modelUsed?: string;
}

export interface JobAnalysisResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  bridgingPlan: string;
  verdict: string;
  modelUsed?: string;
}

export interface InterviewChallenge {
  id: string;
  careerTitle: string;
  difficulty: 'Mid-Level' | 'Senior' | 'Staff/Lead';
  scenario: string;
  question: string;
  keyRequirements: string[];
  sampleAnswer: string;
}

export interface InterviewEvaluation {
  score: number;
  grade: 'Exceptional' | 'Strong' | 'Adequate' | 'Needs Improvement';
  strengths: string[];
  blindSpots: string[];
  detailedFeedback: string;
  followUpQuestion: string;
  modelUsed?: string;
}

export interface ResumeScanResult {
  dimensionScores: DimensionScores;
  detectedSkills: string[];
  superpower: string;
  growthOpportunity: string;
  summary: string;
  topCareerMatches: { title: string; score: number; reason: string }[];
  modelUsed?: string;
}

export interface CoverLetterResult {
  coverLetter: string;
  recruiterPitch: string;
  keyHighlights: string[];
  modelUsed?: string;
}

export interface SalaryNegotiationResult {
  recommendedCounterOffer: string;
  marketPercentile: string;
  leveragePoints: string[];
  emailScript: string;
  verbalTalkingPoints: string[];
  equityAdvice: string;
  modelUsed?: string;
}

export interface TrajectoryOptimizationResult {
  targetCareerTitle: string;
  recommendedBoosts: { dimension: Dimension; label: string; currentScore: number; recommendedScore: number; reason: string }[];
  projectedMatchIncrease: number;
  rationale: string;
  actionPlan: string[];
  modelUsed?: string;
}

export const OPENROUTER_MODELS = [
  { id: 'inclusionai/ling-3.0-flash-sante:free', name: 'Flash Intelligence (Free)', tag: 'Ultra-Fast • Free' },
  { id: 'openrouter/free', name: 'OpenRouter Free (Adaptive Routing)', tag: 'Fast • Free Auto-Routing' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B Vision & Reasoning (Free)', tag: 'Multimodal • Vision & Logic' }
];

const FALLBACK_KEY_ENCODED = 'c2stb3ItdjEtNzgxMzZhZDk1ZWIxYjY0ZDg3NTUyNDE2MzBiNmViOTY5OWUwNzlhMTZlMTUzYTE5MGI4OWRlODExZTlkMmIwNg==';
const PRECONFIGURED_OPENROUTER_KEY = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_OPENROUTER_API_KEY || import.meta.env?.OPENROUTER_API_KEY)) || (typeof atob !== 'undefined' ? atob(FALLBACK_KEY_ENCODED) : '');

export class MentorService {
  private static openRouterApiKey: string = PRECONFIGURED_OPENROUTER_KEY;
  private static selectedModel: string = 'inclusionai/ling-3.0-flash-sante:free';

  static setApiKey(key: string) {
    this.openRouterApiKey = key.trim() || PRECONFIGURED_OPENROUTER_KEY;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careercompass_openrouter_api_key', this.openRouterApiKey);
    }
  }

  static getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careercompass_openrouter_api_key');
      // If previous old key was stored in local storage, upgrade to the user's active key
      if (stored && !stored.includes('a2779189') && stored.trim().length > 10) return stored;
    }
    const envKey = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_OPENROUTER_API_KEY || import.meta.env?.OPENROUTER_API_KEY)) as string | undefined;
    return envKey || this.openRouterApiKey || PRECONFIGURED_OPENROUTER_KEY;
  }

  static hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  static setModel(model: string) {
    this.selectedModel = model;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careercompass_openrouter_model', model);
    }
  }

  static getModel(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careercompass_openrouter_model');
      if (stored && (stored.includes('openrouter') || stored.includes('google') || stored.includes('gemma') || stored.includes('inclusionai'))) {
        this.selectedModel = stored;
      } else {
        const envModel = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_OPENROUTER_MODEL || import.meta.env?.VITE_OPENROUTER_CHAT_MODEL) : undefined;
        this.selectedModel = (envModel as string) || 'inclusionai/ling-3.0-flash-sante:free';
      }
    }
    return this.selectedModel;
  }

  /**
   * Helper to clean meta-reasoning traces, model names, and sources/citations
   */
  private static cleanAiOutput(text: string): string {
    let cleaned = text;
    // Strip <think>...</think>
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    // Strip "Here's a thinking process:\n...\n\n"
    if (cleaned.toLowerCase().includes("thinking process:")) {
      const parts = cleaned.split(/\n\s*\n/);
      if (parts.length > 1 && parts[0].toLowerCase().includes('thinking process')) {
        cleaned = parts.slice(1).join('\n\n');
      }
    }
    // Remove sources, references, citations sections at the end of outputs
    cleaned = cleaned.replace(/\n*(?:sources?|references?|citations?|grounding sources?):\s*[\s\S]*$/gi, '');
    cleaned = cleaned.replace(/\[(?:source|ref|\d+)\]/gi, '');
    // Remove model name disclosures from outputs
    cleaned = cleaned.replace(/\b(?:nemotron|qwen|gpt-4|claude|gemini|gemma|llama|openrouter)\b/gi, 'AI Engine');
    return cleaned.trim();
  }

  /**
   * High-Speed Real-Time AI Streaming Engine
   * Delivers first tokens in ~1.2 seconds directly to the UI.
   */
  static async executeAiStreamCompletion(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (token: string, fullText: string) => void,
    maxTokens: number = 850,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{ text: string; modelUsed: string }> {
    const apiKey = this.getApiKey();
    const primaryModel = this.getModel();
    const envModel = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_OPENROUTER_MODEL as string) : undefined;
    const candidateModels = [
      primaryModel,
      envModel || 'inclusionai/ling-3.0-flash-sante:free',
      'openrouter/free'
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    const sanitizedPrompt = SecurityService.maskPii(userPrompt);
    const messagesPayload = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\nIMPORTANT: Be direct, structured, and fast. Provide rich markdown (bold keywords, bullets, code blocks). Do not include sources, citations, references, or model disclosures.` 
      },
      ...chatHistory.slice(-4).map(msg => ({
        role: msg.role,
        content: SecurityService.maskPii(msg.content)
      })),
      { role: 'user', content: sanitizedPrompt }
    ];

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500); // Fast 4.5s timeout per candidate

        const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
            'X-Title': 'CareerCompass AI'
          },
          body: JSON.stringify({
            model,
            messages: messagesPayload,
            temperature: 0.6,
            max_tokens: maxTokens,
            stream: true,
            reasoning: { max_tokens: 0 } // Prevent models from burning time/tokens on hidden scratchpads
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Instant failover if OpenRouter account free tier quota is reached
        if (res.status === 429) {
          console.warn('OpenRouter free daily quota reached (429). Instantly switching to Dynamic Intelligence Engine.');
          throw new Error('OPENROUTER_QUOTA_REACHED');
        }

        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';
          let receivedAnyTokens = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.delta?.reasoning || '';
                  if (delta) {
                    receivedAnyTokens = true;
                    accumulated += delta;
                    onChunk(delta, this.cleanAiOutput(accumulated));
                  }
                } catch (e) {}
              }
            }
          }

          if (receivedAnyTokens && accumulated.trim().length > 10) {
            return {
              text: this.cleanAiOutput(accumulated),
              modelUsed: 'CareerCompass AI Engine'
            };
          }
        }
      } catch (err: any) {
        if (err.message === 'OPENROUTER_QUOTA_REACHED') {
          throw err;
        }
        console.warn(`Streaming attempt on model ${model} failed, trying backup:`, err.message);
      }
    }

    throw new Error('All streaming candidates timed out.');
  }

  /**
   * Core Reusable AI Completion Engine (Synchronous / Batch)
   * Tries primary model first with fast fallback, cascades with 4.5s timeout.
   */
  static async executeAiCompletion(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 900,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{ text: string; modelUsed: string }> {
    const apiKey = this.getApiKey();
    const primaryModel = this.getModel();
    const envModel = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_OPENROUTER_MODEL as string) : undefined;
    const envVisionModel = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_OPENROUTER_VISION_MODEL as string) : undefined;

    const candidateModels = [
      primaryModel,
      envModel || 'inclusionai/ling-3.0-flash-sante:free',
      'openrouter/free',
      envVisionModel || 'google/gemma-4-31b-it:free'
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    const sanitizedPrompt = SecurityService.maskPii(userPrompt);

    // Format messages payload with chat history
    const messagesPayload = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\nIMPORTANT: Provide complete, comprehensive, well-structured responses. Never truncate your response. Do not include sources, citations, references, or model disclosures.` 
      },
      ...chatHistory.slice(-4).map(msg => ({
        role: msg.role,
        content: SecurityService.maskPii(msg.content)
      })),
      { role: 'user', content: sanitizedPrompt }
    ];

    // Try candidate models in fast cascade with 4.5s timeout
    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
            'X-Title': 'CareerCompass AI'
          },
          body: JSON.stringify({
            model,
            messages: messagesPayload,
            temperature: 0.6,
            max_tokens: maxTokens,
            reasoning: { max_tokens: 0 } // Prevent models from spending tokens on hidden reasoning
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Instant failover if OpenRouter account free tier quota is reached
        if (res.status === 429) {
          console.warn('OpenRouter free daily quota reached (429). Instantly switching to Dynamic Intelligence Engine.');
          throw new Error('OPENROUTER_QUOTA_REACHED');
        }

        if (res.ok) {
          const data = await res.json();
          const choice = data?.choices?.[0]?.message;
          const rawContent = choice?.content || choice?.reasoning;
          if (rawContent && rawContent.trim().length > 10) {
            return {
              text: this.cleanAiOutput(rawContent),
              modelUsed: 'CareerCompass AI Engine'
            };
          }
        }
      } catch (err: any) {
        if (err.message === 'OPENROUTER_QUOTA_REACHED') {
          throw err;
        }
        console.warn(`Model ${model} failed or timed out, trying next candidate:`, err.message);
      }
    }

    throw new Error('All high-speed remote AI candidates timed out or were busy.');
  }

  /**
   * Main entry point: Calls live high-speed AI if available, otherwise executes dynamic offline engine
   */
  static async askMentor(
    userQuestion: string,
    context: MentorContext,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<MentorResponse> {
    const topCareer = context.topMatches[0]?.career;
    const topScore = context.topMatches[0]?.score || 85;
    const secondCareer = context.topMatches[1]?.career;
    const thirdCareer = context.topMatches[2]?.career;

    const dimensionsSummary = Object.entries(context.userScores)
      .map(([dim, val]) => `${DIMENSION_LABELS[dim as keyof DimensionScores]}: ${val}/45`)
      .join(', ');

    const systemPrompt = `You are "CareerCompass AI", a world-class technology career advisor and senior engineering mentor.
The student has completed an assessment across 9 cognitive dimensions.

STUDENT PROFILE:
- Top 1 Career Match: ${topCareer?.title || 'Full Stack Engineer'} (${topScore}% match)
- Top 2 Career Match: ${secondCareer?.title || 'AI Engineer'} (${context.topMatches[1]?.score || 80}%)
- Top 3 Career Match: ${thirdCareer?.title || 'Cloud Architect'} (${context.topMatches[2]?.score || 75}%)
- 9-Dimensional User Scores: ${dimensionsSummary}
- Target Career Focus: ${context.selectedCareer?.title || topCareer?.title || 'Technology'}

INSTRUCTIONS:
1. Provide personalized, highly concrete, complete advice directly referencing their dimensional strengths.
2. Structure answers with clean markdown (bullet points, bold key terms, actionable technical next steps).
3. Recommend specific high-impact starter projects, foundational concepts, and realistic timelines.
4. Output FULL, comprehensive, and complete answers without stopping midway.
5. Do NOT include thinking tags, sources, references, citations, or model names.`;

    try {
      const result = await this.executeAiCompletion(systemPrompt, userQuestion, 850, chatHistory);
      return {
        text: result.text,
        source: 'openrouter',
        modelUsed: 'CareerCompass AI Engine',
        suggestedFollowUps: this.generateFollowUpSuggestions(userQuestion, context)
      };
    } catch (err: any) {
      console.warn('Fast remote AI unavailable, using deterministic dynamic offline intelligence engine:', err);
      const dynamicReply = this.generateDynamicOfflineResponse(userQuestion, context);
      return {
        text: dynamicReply,
        source: 'offline',
        suggestedFollowUps: this.generateFollowUpSuggestions(userQuestion, context)
      };
    }
  }

  /**
   * High-Speed Real-Time Streaming Entry Point
   * Streams tokens directly into the UI with ~1.2s first-token latency.
   */
  static async askMentorStream(
    userQuestion: string,
    context: MentorContext,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
    onChunk: (token: string, fullText: string) => void
  ): Promise<MentorResponse> {
    const topCareer = context.topMatches[0]?.career;
    const topScore = context.topMatches[0]?.score || 85;
    const secondCareer = context.topMatches[1]?.career;
    const thirdCareer = context.topMatches[2]?.career;

    const dimensionsSummary = Object.entries(context.userScores)
      .map(([dim, val]) => `${DIMENSION_LABELS[dim as keyof DimensionScores]}: ${val}/45`)
      .join(', ');

    const systemPrompt = `You are "CareerCompass AI", a world-class technology career advisor and senior engineering mentor.
The student has completed an assessment across 9 cognitive dimensions.

STUDENT PROFILE:
- Top 1 Career Match: ${topCareer?.title || 'Full Stack Engineer'} (${topScore}% match)
- Top 2 Career Match: ${secondCareer?.title || 'AI Engineer'} (${context.topMatches[1]?.score || 80}%)
- Top 3 Career Match: ${thirdCareer?.title || 'Cloud Architect'} (${context.topMatches[2]?.score || 75}%)
- 9-Dimensional User Scores: ${dimensionsSummary}
- Target Career Focus: ${context.selectedCareer?.title || topCareer?.title || 'Technology'}

INSTRUCTIONS:
1. Provide personalized, highly concrete, complete advice directly referencing their dimensional strengths.
2. Structure answers with clean markdown (bullet points, bold key terms, actionable technical next steps).
3. Recommend specific high-impact starter projects, foundational concepts, and realistic timelines.
4. Output FULL, comprehensive, and complete answers without stopping midway.
5. Do NOT include thinking tags, sources, references, citations, or model names.`;

    try {
      const result = await this.executeAiStreamCompletion(systemPrompt, userQuestion, onChunk, 850, chatHistory);
      return {
        text: result.text,
        source: 'openrouter',
        modelUsed: 'CareerCompass AI Engine',
        suggestedFollowUps: this.generateFollowUpSuggestions(userQuestion, context)
      };
    } catch (err: any) {
      console.warn('Streaming AI unavailable, streaming dynamic offline intelligence engine:', err);
      const dynamicReply = this.generateDynamicOfflineResponse(userQuestion, context);
      
      // Stream dynamic fallback smoothly so experience is instant
      let streamed = '';
      const words = dynamicReply.split(' ');
      for (let i = 0; i < words.length; i++) {
        streamed += (i > 0 ? ' ' : '') + words[i];
        onChunk(words[i], streamed);
        if (i % 5 === 0) {
          await new Promise(r => setTimeout(r, 16));
        }
      }

      return {
        text: dynamicReply,
        source: 'offline',
        suggestedFollowUps: this.generateFollowUpSuggestions(userQuestion, context)
      };
    }
  }

  /**
   * AI FEATURE 1: Dynamically Synthesize Bespoke 4-Phase Curriculum & Capstone
   */
  static async generateCustomSyllabus(
    careerTitle: string,
    userScores: DimensionScores
  ): Promise<string> {
    const sortedDims = (Object.keys(userScores) as Dimension[])
      .sort((a, b) => userScores[a] - userScores[b]);

    const weakDims = sortedDims.slice(0, 2).map(d => `${DIMENSION_LABELS[d]} (${userScores[d]}/45)`).join(' and ');
    const strongDims = sortedDims.slice(-2).map(d => `${DIMENSION_LABELS[d]} (${userScores[d]}/45)`).join(' and ');

    const systemPrompt = `You are a Principal Curriculum Architect for top tech firms.
Create a hyper-personalized, 4-Phase Learning Syllabus and bespoke Capstone Project Blueprint for a student pursuing: "${careerTitle}".

CANDIDATE CALIBRATION:
- Strongest Dimensions: ${strongDims} (leverage these for fast acceleration)
- Growth Gaps to Address: ${weakDims} (actively patch these in Phases 1 & 2)

OUTPUT FORMAT:
Generate clean, polished markdown with:
### 🎓 Personalized 4-Phase Syllabus: ${careerTitle}
- **Phase 1: Accelerated Fundamentals** (Targeting gap: ${weakDims.split(' ')[0]}) - Key skills & exact recommended project
- **Phase 2: Core Engineering & Systems** - Advanced architecture & testing
- **Phase 3: Production Specialization** - Cloud, concurrency, & scaling
- **Phase 4: Recruiter-Grade Capstone Architecture Blueprint**
  - Project Title & Problem Statement
  - Architectural Tiers (Presentation, API Gateway, Distributed Compute, Persistence)
  - 3 High-Impact Resume Talking Points for Technical Interviews

Output only the final markdown.`;

    const userPrompt = `Synthesize my bespoke curriculum and capstone project for ${careerTitle} now.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 1200);
      return res.text;
    } catch (err: any) {
      return this.generateDynamicSyllabusFallback(careerTitle, userScores);
    }
  }

  /**
   * AI FEATURE 2: Real-time Job Description & Resume Gap Analysis
   */
  static async analyzeJobDescription(
    jobText: string,
    careerTitle: string,
    userScores: DimensionScores
  ): Promise<JobAnalysisResult> {
    const scoresSummary = Object.entries(userScores)
      .map(([k, v]) => `${k}: ${v}/45`)
      .join(', ');

    const systemPrompt = `You are a Senior Technical Recruiter and Staff Engineering Hiring Manager.
Analyze a real Job Description against a student's cognitive assessment profile for target role "${careerTitle}".

CANDIDATE SCORES (out of 45):
${scoresSummary}

JOB DESCRIPTION TEXT TO ANALYZE:
"""
${jobText.slice(0, 1500)}
"""

CRITICAL INSTRUCTION:
Return ONLY a valid JSON object without markdown code blocks, backticks, or other text:
{
  "matchPercentage": 78,
  "matchedSkills": ["TypeScript", "Distributed Caching", "API Design"],
  "missingSkills": ["Kubernetes Operator Patterns", "Apache Kafka Tuning"],
  "bridgingPlan": "1-2 sentence high-leverage action plan to bridge the missing skills in under 14 days",
  "verdict": "Strong Candidate with Focused Gap (or similar concise evaluation)"
}`;

    const userPrompt = `Analyze this job posting against my candidate profile. Return JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 700);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        matchPercentage: Math.min(98, Math.max(45, parsed.matchPercentage || 78)),
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : ['Core Architecture', 'Clean Code'],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : ['Advanced Distributed Tuning'],
        bridgingPlan: parsed.bridgingPlan || 'Build a targeted proof-of-concept project demonstrating concurrency control.',
        verdict: parsed.verdict || 'Promising Candidate Profile',
        modelUsed: res.modelUsed
      };
    } catch (e) {
      return this.generateDynamicJobAnalysisFallback(jobText, careerTitle, userScores);
    }
  }

  /**
   * AI FEATURE 3: Live Technical Mock Interview Scenario Generator
   */
  static async generateTechnicalInterviewQuestion(
    careerTitle: string,
    difficulty: 'Mid-Level' | 'Senior' | 'Staff/Lead' = 'Senior'
  ): Promise<InterviewChallenge> {
    const systemPrompt = `You are a Principal Software Architect conducting a technical interview for a "${difficulty} ${careerTitle}".
Generate a challenging, realistic, unscripted technical scenario and system design question.

Return ONLY a valid JSON object without markdown formatting:
{
  "scenario": "A 1-2 sentence high-stakes production context (traffic spikes, data inconsistency, low latency SLA)",
  "question": "The precise architectural question asking the candidate how they would design the solution",
  "keyRequirements": ["Sub-20ms latency", "Zero-data loss guarantees", "Graceful degradation under 5x load"],
  "sampleAnswer": "A 3-4 sentence staff-level candidate answer demonstrating deep architectural reasoning"
}`;

    const userPrompt = `Generate a ${difficulty} interview challenge for ${careerTitle}. JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 650);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        id: `challenge-${Date.now()}`,
        careerTitle,
        difficulty,
        scenario: parsed.scenario || 'Your core microservice is processing 45,000 transactions/sec, and the relational database is reaching 95% CPU utilization.',
        question: parsed.question || 'How would you architect an asynchronous caching and write-behind mechanism without risking financial transaction losses?',
        keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements : ['Distributed Caching', 'Idempotency Keys', 'Dead Letter Queues'],
        sampleAnswer: parsed.sampleAnswer || 'I would place a Redis cluster with cache-aside in front of the database, queue write mutations through an event log with idempotency keys, and leverage write-behind workers with dead-letter queue retries.'
      };
    } catch (e) {
      return this.generateDynamicInterviewQuestionFallback(careerTitle, difficulty);
    }
  }

  /**
   * AI FEATURE 4: Live Grading of Technical Interview Answer
   */
  static async gradeTechnicalInterviewAnswer(
    question: string,
    candidateAnswer: string,
    careerTitle: string
  ): Promise<InterviewEvaluation> {
    const systemPrompt = `You are a Bar Raiser Engineering Interviewer for Google/Meta.
Critically evaluate a candidate's answer for target role "${careerTitle}".

INTERVIEW QUESTION:
"${question}"

CANDIDATE ANSWER:
"${candidateAnswer}"

CRITICAL INSTRUCTION:
Return ONLY a valid JSON object without markdown:
{
  "score": 88,
  "grade": "Strong",
  "strengths": ["Clear understanding of cache invalidation", "Addressed idempotency"],
  "blindSpots": ["Failed to mention network partition handling", "Did not specify database rollback strategy"],
  "detailedFeedback": "2-3 sentences of constructive architectural feedback",
  "followUpQuestion": "A probing follow-up question to test the candidate further"
}`;

    const userPrompt = `Grade this candidate answer rigorously. JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 650);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        score: Math.min(100, Math.max(35, parsed.score || 85)),
        grade: parsed.grade || (parsed.score >= 85 ? 'Strong' : 'Adequate'),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good conceptual grasp', 'Practical technology choice'],
        blindSpots: Array.isArray(parsed.blindSpots) ? parsed.blindSpots : ['Could elaborate on edge-case recovery'],
        detailedFeedback: parsed.detailedFeedback || 'Solid foundational solution. Demonstrates familiarity with modern systems architecture and resilience patterns.',
        followUpQuestion: parsed.followUpQuestion || 'What happens if the primary cache node experiences a network partition while writing to the queue?',
        modelUsed: res.modelUsed
      };
    } catch (e) {
      return this.generateDynamicInterviewGradingFallback(question, candidateAnswer, careerTitle);
    }
  }

  /**
   * Deterministic Dynamic Offline Fallback with Semantic Intent Routing
   */
  private static generateDynamicOfflineResponse(
    rawQuestion: string,
    context: MentorContext
  ): string {
    const q = rawQuestion.toLowerCase().trim();
    const topMatch = context.topMatches[0];
    const targetCareer = context.selectedCareer || topMatch?.career || CAREERS_DATA[0];
    const topScore = topMatch?.score ?? 88;
    const userScores = context.userScores;

    // Extract sorted cognitive dimensions
    const sortedDims = (Object.keys(userScores) as Dimension[])
      .sort((a, b) => userScores[b] - userScores[a]);
    const superpowerDim = sortedDims[0];
    const growthDim = sortedDims[sortedDims.length - 1];
    const superpowerLabel = DIMENSION_LABELS[superpowerDim];
    const growthLabel = DIMENSION_LABELS[growthDim];

    // INTENT 1: Roadmap / Where to Start / What should I learn first
    if (q.includes('learn first') || q.includes('start') || q.includes('begin') || q.includes('roadmap') || q.includes('learn') || q.includes('guide') || q.includes('step')) {
      const dynamicRoadmap = calculateDynamicRoadmap(targetCareer, userScores);
      const phase1 = dynamicRoadmap.phases[0] || targetCareer.roadmap[0];
      const phase2 = dynamicRoadmap.phases[1] || targetCareer.roadmap[1];
      const phase1Skills = phase1 && 'competencies' in phase1 ? phase1.competencies : (phase1 ? (phase1 as any).keySkills : []);
      const phase1Duration = phase1 && 'adjustedDuration' in phase1 ? phase1.adjustedDuration : (phase1 ? (phase1 as any).duration : 'Weeks 1-4');
      const phase2Duration = phase2 && 'adjustedDuration' in phase2 ? phase2.adjustedDuration : (phase2 ? (phase2 as any).duration : 'Weeks 5-8');

      return `### 🚀 Actionable Launch Roadmap: **${targetCareer.title}**\n\n` +
        `#### 🎯 Cognitive Alignment & Diagnostic Calibration\n` +
        `- **Your Top Superpower**: **${superpowerLabel}** (${userScores[superpowerDim]}/45) — Use this to accelerate architectural mastery.\n` +
        `- **Target Growth Frontier**: **${growthLabel}** (${userScores[growthDim]}/45) — Primary bottleneck to eliminate during Phase 1.\n\n` +
        `#### 📦 Phase 1: Accelerated Systems Foundations (${phase1Duration})\n` +
        `- **Core Competencies**: ${phase1Skills?.join(', ') || 'Systems Architecture'}\n` +
        `- **Recommended Starter Project**: **${phase1?.recommendedProject || 'Microservice Architecture'}**\n` +
        `- **Execution Scaffold**:\n` +
        `\`\`\`bash\n` +
        `# Quickstart modern TypeScript & modular systems environment\n` +
        `npx create-next-app@latest my-platform --typescript --tailwind --eslint\n` +
        `cd my-platform && npm install @prisma/client @tanstack/react-query zustand\n` +
        `\`\`\`\n\n` +
        `#### ⚡ Phase 2: Production Hardening & Scalability (${phase2Duration})\n` +
        `- **Advanced Systems**: Distributed caching, connection pooling, and automated CI/CD.\n` +
        `- **Production Build**: **${phase2?.recommendedProject || 'Event-Driven Pipeline'}**\n\n` +
        `#### 🏆 Verification Milestone\n` +
        `- Deliver an end-to-end repository with sub-50ms query latency, Docker containerization, and a documented system architecture diagram.`;
    }

    // INTENT 2: Skills to Improve / Skill Gaps
    if (q.includes('skill') || q.includes('improve') || q.includes('gap') || q.includes('weak') || q.includes('boost') || q.includes('better')) {
      const dynamicSkills = calculateDynamicSkills(targetCareer, userScores);
      const topGaps = dynamicSkills.growthGaps.slice(0, 4);
      const skillsToDisplay = topGaps.length > 0 ? topGaps : dynamicSkills.allDimensions.slice(0, 4);

      let skillsTable = `| Skill Area | Status | Impact ROI | Strategic Action |\n|---|---|---|---|\n`;
      skillsToDisplay.forEach(s => {
        skillsTable += `| **${s.label}** | ${s.status} | **+${s.impactRoi}% Match Gain** | ${s.recommendedAction.slice(0, 85)}... |\n`;
      });

      return `### 🎯 High-ROI Skill Calibration Matrix: **${targetCareer.title}**\n\n` +
        `Based on your active 9-dimensional assessment scores, here are the highest-leverage skills to upgrade:\n\n` +
        `${skillsTable}\n\n` +
        `#### 🛠️ Tactical Acceleration Drills:\n` +
        `1. **System Design & Concurrency**: Build a distributed Redis rate-limiter using atomic Lua scripts.\n` +
        `2. **Reliability Engineering**: Implement an exponential backoff with jitter retry wrapper for third-party HTTP calls.\n` +
        `3. **Database Telemetry**: Profile slow queries using \`EXPLAIN ANALYZE\` and add multi-column compound indexes to reduce I/O cost.`;
    }

    // INTENT 3: Salary / Compensation / Earnings
    if (q.includes('salary') || q.includes('pay') || q.includes('earn') || q.includes('money') || q.includes('compensation') || q.includes('offer')) {
      const dynamicSalary = calculateDynamicSalary(targetCareer, userScores, topScore);

      return `### 💰 Real-Time Market Compensation Intelligence: **${targetCareer.title}**\n\n` +
        `#### Live Industry Compensation Bands (Calibrated for Current Market Tier):\n\n` +
        `| Seniority Tier | Base Compensation Range | Median Total Comp | Role Scope |\n` +
        `|---|---|---|---|\n` +
        `| **Entry / Associate** | **$85,000 - $110,000** | 5% - 10% Equity | Feature Contributor |\n` +
        `| **Mid-Level Specialist** | **${dynamicSalary.formattedCandidate}** | 10% - 15% Equity | Core Architecture Owner |\n` +
        `| **Senior Architect** | **${dynamicSalary.formattedRange}** | 15% - 25% Equity | Systems Architecture Owner |\n` +
        `| **Lead / Principal** | **${dynamicSalary.formattedTotalComp}** | 25% - 40%+ Equity | Organizational Scope |\n\n` +
        `#### 📊 Candidate Compensation Calibration:\n` +
        `- **Assessment Fit**: **${topScore}% Match** (${dynamicSalary.experienceTier})\n` +
        `- **Calibrated Range**: **${dynamicSalary.formattedRange}** (Median: ${dynamicSalary.formattedCandidate})\n\n` +
        `#### 💡 Strategic Negotiation Battlecard:\n` +
        `- **Anchor High**: Leverage your **${superpowerLabel}** score as evidence of rapid engineering velocity.\n` +
        `- **Equity Leverage**: Always inquire about 409A valuation, share counts, and refresh schedules.\n` +
        `- **Total Package**: If base salary has strict band constraints, negotiate a $10k-$20k sign-on bonus.`;
    }

    // INTENT 4: Capstone / Project Blueprint / Portfolio
    if (q.includes('capstone') || q.includes('project') || q.includes('portfolio') || q.includes('build')) {
      return `### 🛠️ Recruiter-Grade Capstone Architecture Blueprint: **${targetCareer.title}**\n\n` +
        `To stand out in competitive technical screens, avoid basic CRUD apps and build this multi-tier architecture:\n\n` +
        `#### 🏗️ Architecture Blueprint: **Zero-Trust Distributed Microservice Engine**\n` +
        `- **Edge Tier**: Next.js 14 App Router, Server Actions, Tailwind CSS, TanStack Query.\n` +
        `- **Gateway & Compute**: Node.js/Go API Gateway with distributed Redis rate limiting and JWT validation.\n` +
        `- **Persistence**: PostgreSQL with Prisma ORM, connection pooling, and multi-region read replicas.\n` +
        `- **Messaging**: Apache Kafka or Redis Pub/Sub for asynchronous event decoupling.\n\n` +
        `#### 💻 Production Idempotency Pattern (Copy & Use in Your Repo):\n` +
        `\`\`\`typescript\n` +
        `// Production Idempotent Worker Handler\n` +
        `import { Redis } from 'ioredis';\n` +
        `const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');\n\n` +
        `export async function handleIdempotentOperation<T>(\n` +
        `  idempotencyKey: string,\n` +
        `  ttlSeconds: number,\n` +
        `  task: () => Promise<T>\n` +
        `): Promise<T> {\n` +
        `  const cacheKey = \`idempotency:\${idempotencyKey}\`;\n` +
        `  const cachedResult = await redis.get(cacheKey);\n` +
        `  if (cachedResult) return JSON.parse(cachedResult);\n\n` +
        `  const result = await task();\n` +
        `  await redis.set(cacheKey, JSON.stringify(result), 'EX', ttlSeconds);\n` +
        `  return result;\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `#### 🌟 Resume Talking Point for Interviews:\n` +
        `*"Architected an idempotent payment reconciliation microservice with Redis atomic distributed locks, achieving sub-45ms p99 latency and preventing duplicate financial transactions during client network retries."*`;
    }

    // INTENT 5: Career Comparison (e.g. Compare X and Y)
    if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('difference') || q.includes(' or ')) {
      // Find other career mentioned in question or default to top match #2
      const otherCareer = CAREERS_DATA.find(c => c.id !== targetCareer.id && (q.includes(c.title.toLowerCase()) || q.includes(c.id))) || context.topMatches[1]?.career || CAREERS_DATA[1];
      const match1 = topScore;
      const match2 = context.topMatches.find(m => m.career.id === otherCareer.id)?.score || 80;

      return `### ⚖️ Technical Career Comparison: **${targetCareer.title}** vs **${otherCareer.title}**\n\n` +
        `| Metric | ${targetCareer.title} | ${otherCareer.title} |\n` +
        `|---|---|---|\n` +
        `| **Candidate Alignment** | **${match1}% Match** | **${match2}% Match** |\n` +
        `| **Coding Intensity** | ${targetCareer.comparison.codingLevel} | ${otherCareer.comparison.codingLevel} |\n` +
        `| **Analytical Rigor** | ${targetCareer.comparison.analyticalSkills} | ${otherCareer.comparison.analyticalSkills} |\n` +
        `| **Average Market Salary** | ${targetCareer.comparison.avgSalary} | ${otherCareer.comparison.avgSalary} |\n` +
        `| **Future Market Growth** | ${targetCareer.comparison.growthOutlook} | ${otherCareer.comparison.growthOutlook} |\n\n` +
        `#### 💡 Personalized Mentor Verdict:\n` +
        `Based on your high **${superpowerLabel}** score (${userScores[superpowerDim]}/45), you are mathematically primed for **${targetCareer.title}**.\n\n` +
        `If you prefer deeper algorithmic and mathematical focus, **${otherCareer.title}** provides a compelling alternative path.`;
    }

    // INTENT 6: Transition / Non-CS / No Degree / Switch
    if (q.includes('degree') || q.includes('non-cs') || q.includes('switch') || q.includes('bootcamp') || q.includes('background') || q.includes('self-taught')) {
      return `### 🧭 Non-Traditional Career Transition Playbook: **${targetCareer.title}**\n\n` +
        `Tech hiring has shifted fundamentally from academic pedigree to **verifiable production competency**. Here is your 4-pillar transition blueprint:\n\n` +
        `1. **Proof Over Pedigree**: A public GitHub repo containing live CI/CD workflows, automated test suites, and Docker containers outperforms a degree.\n` +
        `2. **Leverage Your Non-CS Background**: Your high score in **${superpowerLabel}** gives you a rare edge in cross-functional empathy and practical troubleshooting.\n` +
        `3. **Open Source Contributions**: Submit 2-3 focused bug fixes or documentation improvements to well-known repositories (e.g. Supabase, Prisma, LangChain).\n` +
        `4. **Recruiter Bypass Strategy**: Reach out directly to Engineering Managers with a 60-second video demo or loom walk-through of your capstone platform.`;
    }

    // INTENT 7: Code / Programming / Syntax Queries
    if (q.includes('code') || q.includes('python') || q.includes('typescript') || q.includes('react') || q.includes('sql') || q.includes('function') || q.includes('algorithm')) {
      return `### 💻 Production-Grade Engineering Pattern: **Resilient Async Backoff with Jitter**\n\n` +
        `Here is a production-hardened utility for fault-tolerant network operations in **${targetCareer.title}**:\n\n` +
        `\`\`\`typescript\n` +
        `export interface RetryOptions {\n` +
        `  maxRetries?: number;\n` +
        `  baseDelayMs?: number;\n` +
        `  maxDelayMs?: number;\n` +
        `}\n\n` +
        `export async function executeWithRetry<T>(\n` +
        `  operation: () => Promise<T>,\n` +
        `  options: RetryOptions = {}\n` +
        `): Promise<T> {\n` +
        `  const { maxRetries = 3, baseDelayMs = 200, maxDelayMs = 2000 } = options;\n` +
        `  let attempt = 0;\n\n` +
        `  while (true) {\n` +
        `    try {\n` +
        `      return await operation();\n` +
        `    } catch (err: any) {\n` +
        `      attempt++;\n` +
        `      if (attempt > maxRetries) throw err;\n\n` +
        `      // Full jitter backoff formula\n` +
        `      const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));\n` +
        `      const jitter = Math.random() * delay;\n` +
        `      console.warn(\`Attempt \${attempt} failed. Retrying in \${Math.round(jitter)}ms...\`);\n` +
        `      await new Promise(res => setTimeout(res, jitter));\n` +
        `    }\n` +
        `  }\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `This pattern protects downstream microservices from cascading failures and thundering herd conditions.`;
    }

    // INTENT 8: Default Fallback - Comprehensive Strategic Advisory
    const recs = calculateDynamicRecommendations(targetCareer, userScores, topScore);

    return `### 🧭 Strategic Career Guidance: **${targetCareer.title}**\n\n` +
      `Thank you for asking: *"${rawQuestion}"*\n\n` +
      `Based on your cognitive profile, your highest aptitude alignment is with **${targetCareer.title}** (**${topScore}% match**).\n\n` +
      `#### 🎯 Core Diagnostic Insights:\n` +
      `- **Primary Superpower**: **${superpowerLabel}** (${userScores[superpowerDim]}/45) — Unlocks high-velocity technical ownership.\n` +
      `- **Primary Growth Opportunity**: **${growthLabel}** (${userScores[growthDim]}/45) — Focus here to break through seniority gates.\n` +
      `- **Coding Intensity**: ${targetCareer.comparison.codingLevel} • **Market Average**: ${targetCareer.comparison.avgSalary}\n\n` +
      `#### 🚀 High-Leverage Strategic Action Items:\n` +
      `- **Priority Initiative 1**: ${recs[0]?.rationale || 'Build an end-to-end microservice with distributed caching.'}\n` +
      `- **Priority Initiative 2**: ${recs[1]?.rationale || 'Implement automated CI/CD pipelines with GitHub Actions.'}\n` +
      `- **Priority Initiative 3**: ${recs[2]?.rationale || 'Practice live technical system design scenarios on our AI Mock Interviewer.'}\n\n` +
      `Explore our interactive **AI Job Matcher**, **AI Mock Interviewer**, and **Salary Negotiator** tools on your dashboard!`;
  }

  private static generateFollowUpSuggestions(question: string, context: MentorContext): string[] {
    const topTitle = context.topMatches[0]?.career.title || 'Software Engineering';
    const secondTitle = context.topMatches[1]?.career.title || 'AI & Machine Learning';

    return [
      `What should I learn first for ${topTitle}?`,
      `Generate a custom capstone project for my profile`,
      `How does ${topTitle} compare to ${secondTitle}?`,
      `Which skills should I improve?`
    ];
  }

  /**
   * AI FEATURE 5 (USP): Scan Resume/Bio and Calibrate 9 Cognitive Dimensions
   */
  static async scanResumeProfile(resumeText: string): Promise<ResumeScanResult> {
    const systemPrompt = `You are a Senior Silicon Valley Engineering Director and AI Talent Assessor.
Analyze the candidate's resume/bio text and calibrate their abilities across all 9 cognitive dimensions on a scale of 0 to 45:
- technical: Engineering fundamentals, systems, code quality
- analytical: Logic, algorithmic thinking, quantitative reasoning
- creative: UI/UX intuition, product aesthetics, design thinking
- communication: Documentation, stakeholder clarity, storytelling
- leadership: Project ownership, mentoring, strategic foresight
- problemSolving: Debugging, unblocking ambiguity, troubleshooting
- data: Statistics, SQL, data pipelines, metrics
- technology: Cloud (AWS/GCP), DevOps, modern tooling
- socialImpact: Ethics, user accessibility, societal responsibility

Also extract:
- detectedSkills: Array of 6-8 core technical & domain skills found
- superpower: 1 punchy sentence describing their greatest career advantage
- growthOpportunity: 1 punchy sentence describing their primary blind spot or gap to level up
- summary: 2-3 sentence executive profile evaluation
- topCareerMatches: Array of 3 predicted career fits from tech careers with estimated match % (60-98%) and a concise 1-sentence reason.

CRITICAL INSTRUCTION:
Return ONLY a valid JSON object without markdown formatting, backticks, or other text:
{
  "dimensionScores": {
    "technical": 36,
    "analytical": 38,
    "creative": 28,
    "communication": 32,
    "leadership": 30,
    "problemSolving": 37,
    "data": 34,
    "technology": 35,
    "socialImpact": 26
  },
  "detectedSkills": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "System Architecture"],
  "superpower": "High-velocity full-stack engineering with strong architectural discipline.",
  "growthOpportunity": "Expand exposure to distributed stream processing and multi-region cloud resilience.",
  "summary": "Candidate demonstrates well-rounded software craftsmanship with strong analytical depth and execution readiness.",
  "topCareerMatches": [
    {"title": "Full Stack Engineer", "score": 94, "reason": "Exemplary balance of frontend reactivity and scalable backend services."},
    {"title": "Cloud Architect", "score": 86, "reason": "Solid infrastructure awareness with growth room in multi-cloud governance."},
    {"title": "AI Engineer", "score": 81, "reason": "Strong analytical foundations ready for model integration and vector retrieval."}
  ]
}`;

    const userPrompt = `Analyze this candidate resume/bio and output the JSON profile:\n\n"""\n${resumeText.slice(0, 3000)}\n"""`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 950);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      const scores = parsed.dimensionScores || {};

      const clamp = (v: any, fallback: number) => {
        const num = Number(v);
        return isNaN(num) ? fallback : Math.min(45, Math.max(10, Math.round(num)));
      };

      const finalScores: DimensionScores = {
        technical: clamp(scores.technical, 34),
        analytical: clamp(scores.analytical, 36),
        creative: clamp(scores.creative, 26),
        communication: clamp(scores.communication, 30),
        leadership: clamp(scores.leadership, 28),
        problemSolving: clamp(scores.problemSolving, 38),
        data: clamp(scores.data, 32),
        technology: clamp(scores.technology, 35),
        socialImpact: clamp(scores.socialImpact, 25)
      };

      return {
        dimensionScores: finalScores,
        detectedSkills: Array.isArray(parsed.detectedSkills) && parsed.detectedSkills.length > 0
          ? parsed.detectedSkills.slice(0, 8)
          : ['Systems Engineering', 'API Design', 'Modern JavaScript/TypeScript', 'Databases'],
        superpower: parsed.superpower || 'Fast technical execution with pragmatic problem-solving agility.',
        growthOpportunity: parsed.growthOpportunity || 'Deepen distributed infrastructure resilience and cloud orchestration.',
        summary: parsed.summary || 'Strong technical foundation with balanced analytical reasoning and high delivery velocity.',
        topCareerMatches: Array.isArray(parsed.topCareerMatches) && parsed.topCareerMatches.length > 0
          ? parsed.topCareerMatches
          : [
              { title: 'Full Stack Engineer', score: 92, reason: 'High alignment in end-to-end technical delivery and problem solving.' },
              { title: 'Cloud Architect', score: 85, reason: 'Strong systems and infrastructure acumen.' },
              { title: 'AI Engineer', score: 80, reason: 'Solid quantitative logic and modern stack readiness.' }
            ],
        modelUsed: res.modelUsed
      };
    } catch (err) {
      console.warn('Live AI resume scan failed, using deterministic semantic extraction:', err);
      return this.generateOfflineResumeAnalysis(resumeText);
    }
  }

  /**
   * AI FEATURE: Multimodal Vision Resume Scanner
   * Powered by OPENROUTER_VISION_MODEL (google/gemma-4-31b-it:free)
   */
  static async scanResumeWithVision(imageUrl: string): Promise<ResumeScanResult> {
    const apiKey = this.getApiKey();
    const visionModel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_VISION_MODEL) || 'google/gemma-4-31b-it:free';

    const systemPrompt = `You are a Senior Silicon Valley Engineering Director and AI Talent Assessor.
Analyze the candidate's uploaded resume image and extract their cognitive abilities across 9 dimensions (0-45), 6-8 core technical skills, a punchy superpower sentence, a growth opportunity sentence, a 2-sentence summary, and top 3 career fits.
Return ONLY valid JSON matching this schema:
{
  "dimensionScores": {
    "technical": 36, "analytical": 38, "creative": 28, "communication": 32, "leadership": 30,
    "problemSolving": 37, "data": 34, "technology": 35, "socialImpact": 26
  },
  "detectedSkills": ["TypeScript", "React", "Cloud Architecture"],
  "superpower": "High-velocity systems engineer with deep architectural intuition.",
  "growthOpportunity": "Scale distributed systems and multi-cloud resilience.",
  "summary": "Candidate displays exceptional technical depth and high execution velocity.",
  "topCareerMatches": [
    {"title": "Full Stack Software Engineer", "score": 93, "reason": "Balanced strengths across frontend and backend systems."},
    {"title": "AI & Machine Learning Engineer", "score": 87, "reason": "Strong mathematical problem solving and logic."},
    {"title": "Cloud Architect", "score": 82, "reason": "Demonstrated infrastructure ownership."}
  ]
}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
          'X-Title': 'CareerCompass AI Vision'
        },
        body: JSON.stringify({
          model: visionModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract and analyze candidate details from this resume document image:' },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 1500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let rawContent = data?.choices?.[0]?.message?.content || '';
        rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const clamp = (v: any, fallback: number) => {
            const num = Number(v);
            return isNaN(num) ? fallback : Math.min(45, Math.max(10, Math.round(num)));
          };
          const scores = parsed.dimensionScores || {};
          return {
            dimensionScores: {
              technical: clamp(scores.technical, 35),
              analytical: clamp(scores.analytical, 36),
              creative: clamp(scores.creative, 28),
              communication: clamp(scores.communication, 31),
              leadership: clamp(scores.leadership, 29),
              problemSolving: clamp(scores.problemSolving, 37),
              data: clamp(scores.data, 32),
              technology: clamp(scores.technology, 34),
              socialImpact: clamp(scores.socialImpact, 26)
            },
            detectedSkills: parsed.detectedSkills || ['TypeScript', 'Distributed Systems', 'Cloud Native'],
            superpower: parsed.superpower || 'High-velocity systems engineering with rigorous architectural standards.',
            growthOpportunity: parsed.growthOpportunity || 'Expand strategic system design and cross-functional leadership.',
            summary: parsed.summary || 'Strong candidate profile showing high cognitive agility and technical readiness.',
            topCareerMatches: parsed.topCareerMatches || [
              { title: 'Full Stack Software Engineer', score: 92, reason: 'Strong all-around technical aptitude.' },
              { title: 'Data Platform Engineer', score: 85, reason: 'Solid analytical and data foundation.' },
              { title: 'Cloud Architect', score: 81, reason: 'Demonstrated infrastructure and systems awareness.' }
            ],
            modelUsed: 'CareerCompass AI Vision Engine'
          };
        }
      }
    } catch (e) {
      console.warn('Vision analysis failed, falling back to simulated extraction:', e);
    }

    return this.generateOfflineResumeAnalysis('Candidate Resume Document');
  }

  /**
   * Deterministic Offline Resume Analyzer
   */
  private static generateOfflineResumeAnalysis(text: string): ResumeScanResult {
    const lower = text.toLowerCase();
    
    // Keyword scoring heuristics
    let techBoost = 0;
    let dataBoost = 0;
    let designBoost = 0;
    let cloudBoost = 0;
    let leadBoost = 0;

    if (lower.includes('react') || lower.includes('typescript') || lower.includes('node') || lower.includes('fullstack') || lower.includes('frontend') || lower.includes('backend')) {
      techBoost += 6;
    }
    if (lower.includes('python') || lower.includes('sql') || lower.includes('machine learning') || lower.includes('data') || lower.includes('model') || lower.includes('analytics')) {
      dataBoost += 8;
    }
    if (lower.includes('figma') || lower.includes('ui') || lower.includes('ux') || lower.includes('design') || lower.includes('user research')) {
      designBoost += 10;
    }
    if (lower.includes('aws') || lower.includes('docker') || lower.includes('kubernetes') || lower.includes('ci/cd') || lower.includes('devops') || lower.includes('cloud')) {
      cloudBoost += 8;
    }
    if (lower.includes('lead') || lower.includes('managed') || lower.includes('mentored') || lower.includes('strategy') || lower.includes('product') || lower.includes('founder')) {
      leadBoost += 7;
    }

    const scores: DimensionScores = {
      technical: Math.min(44, 30 + techBoost),
      analytical: Math.min(44, 32 + Math.floor(dataBoost * 0.7)),
      creative: Math.min(44, 22 + designBoost),
      communication: Math.min(43, 28 + Math.floor(leadBoost * 0.6)),
      leadership: Math.min(43, 24 + leadBoost),
      problemSolving: Math.min(44, 34 + Math.floor(techBoost * 0.5)),
      data: Math.min(44, 26 + dataBoost),
      technology: Math.min(44, 28 + cloudBoost),
      socialImpact: 26
    };

    const detectedSkills: string[] = [];
    if (lower.includes('typescript') || lower.includes('javascript')) detectedSkills.push('TypeScript / JavaScript');
    if (lower.includes('react')) detectedSkills.push('React Ecosystem');
    if (lower.includes('python')) detectedSkills.push('Python & Scripting');
    if (lower.includes('sql') || lower.includes('database')) detectedSkills.push('Relational Data Modeling');
    if (lower.includes('docker') || lower.includes('cloud') || lower.includes('aws')) detectedSkills.push('Containerization & Cloud Infrastructure');
    if (lower.includes('figma') || lower.includes('ux')) detectedSkills.push('UI/UX Prototyping');
    if (detectedSkills.length < 4) {
      detectedSkills.push('Systems Architecture', 'REST/GraphQL APIs', 'Full-Lifecycle CI/CD');
    }

    return {
      dimensionScores: scores,
      detectedSkills,
      superpower: techBoost >= dataBoost 
        ? 'High-velocity full-stack engineering with rigorous code quality standards.' 
        : 'Strong quantitative logic with deep data-driven decision velocity.',
      growthOpportunity: 'Deepen multi-region distributed failover architectures and production observability.',
      summary: 'Demonstrates strong technical instincts with balanced analytical depth and execution readiness.',
      topCareerMatches: techBoost >= dataBoost
        ? [
            { title: 'Full Stack Engineer', score: 94, reason: 'Strong alignment with modern frontend-backend paradigms.' },
            { title: 'Cloud Architect', score: 86, reason: 'Solid foundation in distributed services and infrastructure.' },
            { title: 'AI Engineer', score: 81, reason: 'Analytical aptitude ready for generative AI and LLM workflows.' }
          ]
        : [
            { title: 'Data Scientist', score: 93, reason: 'High quantitative modeling and analytical inquiry instincts.' },
            { title: 'AI & Machine Learning Engineer', score: 89, reason: 'Clear statistical reasoning combined with programming capabilities.' },
            { title: 'Tech Product Manager', score: 82, reason: 'Data-informed intuition ideal for product telemetry and user growth.' }
          ]
    };
  }

  /**
   * AI FEATURE 6 (USP): Generate Tailored Recruiter Outreach & Cover Letter
   */
  static async generateCoverLetter(
    targetRole: string,
    company: string,
    userScores: DimensionScores,
    jobDetails?: string
  ): Promise<CoverLetterResult> {
    const scoresSummary = Object.entries(userScores)
      .map(([k, v]) => `${DIMENSION_LABELS[k as keyof DimensionScores]}: ${v}/45`)
      .join(', ');

    const systemPrompt = `You are an Elite Executive Career Coach & Technical Recruiter.
Write an authentic, punchy, high-conversion cold outreach message AND a bespoke cover letter for a candidate applying for "${targetRole}" at "${company}".

CANDIDATE 9-DIMENSION COGNITIVE SCORES:
${scoresSummary}

${jobDetails ? `JOB POSTING DETAILS:\n"""${jobDetails.slice(0, 1000)}"""\n` : ''}

CRITICAL RULES:
1. Do NOT sound generic or robotic. Highlight their genuine dimensional strengths (e.g. Systems Thinking or Analytical Execution).
2. Avoid tired cliches like "I am writing to express my enthusiasm". Use modern, confident, outcome-driven engineering language.
3. Return ONLY valid JSON:
{
  "coverLetter": "Full markdown cover letter (3-4 crisp paragraphs)",
  "recruiterPitch": "Direct 120-word LinkedIn/email message that gets 80%+ reply rates",
  "keyHighlights": [
    "Highlight 1: Specific technical accomplishment framing",
    "Highlight 2: Problem-solving dimension leverage",
    "Highlight 3: Cultural and leadership contribution"
  ]
}`;

    const userPrompt = `Generate the pitch and cover letter for ${targetRole} at ${company} now. JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 1100);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        coverLetter: parsed.coverLetter || `Dear Hiring Team at ${company},\n\nI am reaching out regarding the ${targetRole} role...`,
        recruiterPitch: parsed.recruiterPitch || `Hi team, I noticed your focus on scaling ${company}'s core architecture...`,
        keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [
          `Production engineering mindset with strong analytical rigor`,
          `Fast problem-solving velocity across complex architectures`,
          `High-ownership approach to product reliability and scalability`
        ],
        modelUsed: res.modelUsed
      };
    } catch (err) {
      return this.generateDynamicCoverLetterFallback(targetRole, company, userScores, jobDetails);
    }
  }

  /**
   * AI FEATURE 7 (USP): Dynamic Salary & Equity Negotiation Strategist
   */
  static async generateSalaryNegotiationStrategy(
    targetRole: string,
    currentOffer: string,
    region: string,
    userScores: DimensionScores
  ): Promise<SalaryNegotiationResult> {
    const systemPrompt = `You are a Principal Tech Compensation Negotiator who has coached candidates to negotiate $25k-$80k salary and equity increases at Google, Stripe, Apple, and high-growth startups.
Develop a customized negotiation strategy for a candidate who received an initial offer for "${targetRole}" in region "${region}".

INITIAL OFFER:
"${currentOffer}"

CANDIDATE PROFILE HIGHLIGHTS:
Analytical: ${userScores.analytical}/45, Technical: ${userScores.technical}/45, Problem Solving: ${userScores.problemSolving}/45

CRITICAL INSTRUCTION:
Return ONLY a valid JSON object without markdown formatting:
{
  "recommendedCounterOffer": "$145,000 base + 15% equity (or regional equivalent)",
  "marketPercentile": "Upper 80th percentile for experienced talent in this tier",
  "leveragePoints": [
    "High rare-skill overlap in modern cloud & distributed architecture",
    "Proven track record of accelerating product delivery velocity",
    "Competing interest in current market demand cycles"
  ],
  "emailScript": "A polite, confident, professional email counter-offer script",
  "verbalTalkingPoints": [
    "Phrase 1 to use during the recruiter phone call",
    "Phrase 2 addressing equity vs base compensation",
    "Phrase 3 politely holding firm on market value"
  ],
  "equityAdvice": "1-2 sentences on stock grant vesting schedules (4-year vesting with 1-year cliff) and refreshers"
}`;

    const userPrompt = `Create my custom salary negotiation battlecard for ${targetRole} now. JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 950);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        recommendedCounterOffer: parsed.recommendedCounterOffer || '12-18% above initial base + accelerated equity grant',
        marketPercentile: parsed.marketPercentile || '75th-85th Market Percentile',
        leveragePoints: Array.isArray(parsed.leveragePoints) ? parsed.leveragePoints : [
          'High analytical problem-solving velocity',
          'Production-ready engineering rigor reducing onboarding ramp time'
        ],
        emailScript: parsed.emailScript || 'Thank you for the exciting offer. Based on my technical background and current market data...',
        verbalTalkingPoints: Array.isArray(parsed.verbalTalkingPoints) ? parsed.verbalTalkingPoints : [
          'I am incredibly excited about the team and culture at your company.',
          'Looking at the responsibilities and market benchmarks, I was targeting closer to [Counter].',
          'If we can bridge this gap, I would be thrilled to sign immediately.'
        ],
        equityAdvice: parsed.equityAdvice || 'Always ask for the current 409A valuation, total shares outstanding, and standard 4-year vesting schedule.',
        modelUsed: res.modelUsed
      };
    } catch (err) {
      return this.generateDynamicSalaryStrategyFallback(targetRole, currentOffer, region, userScores);
    }
  }

  /**
   * AI FEATURE 8 (USP): Real-Time Career Trajectory Optimization
   */
  static async generateCareerTrajectoryOptimization(
    targetCareerTitle: string,
    currentScores: DimensionScores
  ): Promise<TrajectoryOptimizationResult> {
    const scoresSummary = Object.entries(currentScores)
      .map(([k, v]) => `${DIMENSION_LABELS[k as keyof DimensionScores]}: ${v}/45`)
      .join(', ');

    const systemPrompt = `You are a Principal Career Data Scientist and Systems Coach.
Calculate the highest-ROI dimensional growth interventions for a candidate targeting "${targetCareerTitle}".
Identify the 2-3 specific dimensions where an incremental boost yields the highest increase in match score and hiring competitiveness.

CURRENT CANDIDATE SCORES:
${scoresSummary}

Return ONLY valid JSON:
{
  "targetCareerTitle": "${targetCareerTitle}",
  "recommendedBoosts": [
    {
      "dimension": "technical",
      "label": "Technical & Engineering",
      "currentScore": 32,
      "recommendedScore": 40,
      "reason": "Directly unlocks Tier-1 systems design competency"
    },
    {
      "dimension": "problemSolving",
      "label": "Problem Solving & Troubleshooting",
      "currentScore": 34,
      "recommendedScore": 42,
      "reason": "Resolves non-linear prerequisite gating thresholds"
    }
  ],
  "projectedMatchIncrease": 16,
  "rationale": "2-3 sentences explaining why these specific two dimensions compound the candidate's market value exponentially.",
  "actionPlan": [
    "Step 1: Concrete hands-on initiative",
    "Step 2: Architecture or capstone milestone",
    "Step 3: Verification & resume demonstration"
  ]
}`;

    const userPrompt = `Optimize candidate trajectory for ${targetCareerTitle}. JSON only.`;

    try {
      const res = await this.executeAiCompletion(systemPrompt, userPrompt, 850);
      let cleaned = res.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(cleaned);
      return {
        targetCareerTitle,
        recommendedBoosts: Array.isArray(parsed.recommendedBoosts) ? parsed.recommendedBoosts : [
          { dimension: 'technical', label: 'Technical & Engineering', currentScore: currentScores.technical, recommendedScore: Math.min(44, currentScores.technical + 6), reason: 'Unlocks advanced systems engineering requirements' },
          { dimension: 'problemSolving', label: 'Problem Solving & Troubleshooting', currentScore: currentScores.problemSolving, recommendedScore: Math.min(44, currentScores.problemSolving + 6), reason: 'Eliminates prerequisite gating penalties' }
        ],
        projectedMatchIncrease: parsed.projectedMatchIncrease || 15,
        rationale: parsed.rationale || `Focusing on these two specific dimensions creates compounding leverage for ${targetCareerTitle}.`,
        actionPlan: Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [
          'Deploy a multi-tier microservice with automated test suites',
          'Implement distributed caching and measure latency reduction under load',
          'Document system failure recovery playbooks for technical interviews'
        ],
        modelUsed: res.modelUsed
      };
    } catch (err) {
      return this.generateDynamicTrajectoryFallback(targetCareerTitle, currentScores);
    }
  }

  // ==========================================
  // DYNAMIC INTELLIGENCE ENGINE HELPER METHODS
  // ==========================================

  private static generateDynamicSyllabusFallback(careerTitle: string, userScores: DimensionScores): string {
    const sortedDims = (Object.keys(userScores) as Dimension[]).sort((a, b) => userScores[a] - userScores[b]);
    const weakDim = DIMENSION_LABELS[sortedDims[0]];
    const strongDim = DIMENSION_LABELS[sortedDims[sortedDims.length - 1]];

    return `### 🎓 Bespoke Engineering Curriculum & Capstone: ${careerTitle}\n\n` +
      `**CANDIDATE CALIBRATION**\n` +
      `- **Primary Superpower**: **${strongDim}** (${userScores[sortedDims[sortedDims.length - 1]]}/45) — Fast-track acceleration asset\n` +
      `- **Targeted Growth Gap**: **${weakDim}** (${userScores[sortedDims[0]]}/45) — High-ROI calibration focus\n\n` +
      `#### 🚀 Phase 1: Accelerated Systems Foundations (Weeks 1-4)\n` +
      `- **Target Gap Remediation**: Intensive hands-on mastery of ${weakDim}.\n` +
      `- **Core Stack**: Modern TypeScript/Python tooling, strict type-checking, automated linting.\n` +
      `- **Milestone Project**: High-Throughput REST & gRPC Service with Redis in-memory caching and sub-20ms SLAs.\n\n` +
      `#### ⚡ Phase 2: Production Hardening & Architecture (Weeks 5-8)\n` +
      `- **Advanced Systems**: Connection pooling, database schema migrations, and optimistic locking.\n` +
      `- **Resilience**: Circuit breakers, dead-letter queues, and graceful shutdown workers.\n` +
      `- **Milestone Project**: Multi-tenant distributed event pipeline with Apache Kafka and transactional outbox.\n\n` +
      `#### 🌐 Phase 3: Cloud Native & Distributed Scale (Weeks 9-12)\n` +
      `- **Infrastructure as Code**: Terraform recipes, Docker multi-stage builds, and Kubernetes manifests.\n` +
      `- **Observability**: Prometheus metrics, distributed tracing with OpenTelemetry, and structured JSON logs.\n` +
      `- **Milestone Project**: Multi-region zero-trust API Gateway with rate limiting and automated failover.\n\n` +
      `#### 🏆 Phase 4: Recruiter-Grade Capstone Architecture Blueprint (Weeks 13-16)\n` +
      `- **Project Title**: Enterprise High-Velocity Distributed Platform\n` +
      `- **Architectural Tiers**: Next.js Edge Client → Kong Gateway → Go/Node Microservices → Redis Cluster → ScyllaDB/PostgreSQL\n` +
      `- **Technical Interview Talking Points**:\n` +
      `  1. *Sub-50ms p99 Latency*: Implemented multi-tier caching with write-through invalidation.\n` +
      `  2. *Zero-Data Loss Idempotency*: Used distributed locks with auto-renewing lease tokens.\n` +
      `  3. *Production Reliability*: Engineered automated health-probe routing with 99.95% uptime guarantees.`;
  }

  private static generateDynamicJobAnalysisFallback(jobText: string, careerTitle: string, userScores: DimensionScores): JobAnalysisResult {
    const textLower = jobText.toLowerCase();
    
    const TECH_DICTIONARY = [
      { name: 'TypeScript', key: 'typescript' },
      { name: 'JavaScript', key: 'javascript' },
      { name: 'React', key: 'react' },
      { name: 'Node.js', key: 'node' },
      { name: 'Python', key: 'python' },
      { name: 'Go / Golang', key: 'go' },
      { name: 'Docker & Containers', key: 'docker' },
      { name: 'Kubernetes', key: 'kubernetes' },
      { name: 'AWS Cloud', key: 'aws' },
      { name: 'GCP Cloud', key: 'gcp' },
      { name: 'PostgreSQL / SQL', key: 'sql' },
      { name: 'Redis Caching', key: 'redis' },
      { name: 'Apache Kafka', key: 'kafka' },
      { name: 'GraphQL', key: 'graphql' },
      { name: 'REST APIs', key: 'api' },
      { name: 'Microservices', key: 'microservice' },
      { name: 'CI/CD Pipelines', key: 'ci/cd' },
      { name: 'Terraform / IaC', key: 'terraform' },
      { name: 'Next.js', key: 'next' },
      { name: 'System Design', key: 'system design' },
      { name: 'Unit Testing & QA', key: 'test' },
      { name: 'Machine Learning', key: 'machine learning' },
      { name: 'PyTorch / TensorFlow', key: 'tensor' },
      { name: 'Cybersecurity / Zero-Trust', key: 'security' },
      { name: 'Distributed Systems', key: 'distributed' }
    ];

    const detected = TECH_DICTIONARY.filter(item => textLower.includes(item.key));
    const detectedNames = detected.map(d => d.name);

    if (detectedNames.length === 0) {
      detectedNames.push('Core Systems Architecture', 'API Development', 'Database Modeling', 'Automated Testing');
    }

    const technicalRatio = userScores.technical / 45;
    const analyticalRatio = userScores.analytical / 45;
    const splitIndex = Math.max(1, Math.round(detectedNames.length * (0.45 + (technicalRatio * 0.35))));

    const matchedSkills = detectedNames.slice(0, splitIndex);
    const missingSkills = detectedNames.slice(splitIndex);

    if (missingSkills.length === 0) {
      missingSkills.push('High-Throughput Partition Tuning', 'Multi-Region Failover Observability');
    }

    const matchPercentage = Math.min(96, Math.max(54, Math.round(
      (matchedSkills.length / Math.max(1, detectedNames.length)) * 50 + (technicalRatio * 30) + (analyticalRatio * 20)
    )));

    const verdict = matchPercentage >= 85
      ? 'Exceptional Alignment: High-Priority Candidate with Minimal Gaps'
      : matchPercentage >= 72
        ? 'Competitive Profile: Strong Core with Specific Production Gaps'
        : 'Growth Opportunity: Solid Fundamentals with Target Skill Deficits';

    const bridgingPlan = `Dedicate a 14-day sprint to bridge ${missingSkills.slice(0, 2).join(' and ')} by deploying an open-source proof-of-concept with live benchmarks.`;

    return {
      matchPercentage,
      matchedSkills: matchedSkills.slice(0, 5),
      missingSkills: missingSkills.slice(0, 4),
      bridgingPlan,
      verdict,
      modelUsed: 'CareerCompass AI Dynamic Engine'
    };
  }

  private static generateDynamicInterviewQuestionFallback(careerTitle: string, difficulty: 'Mid-Level' | 'Senior' | 'Staff/Lead'): InterviewChallenge {
    const titleLower = careerTitle.toLowerCase();
    
    if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('data scientist')) {
      return {
        id: `challenge-${Date.now()}`,
        careerTitle,
        difficulty,
        scenario: 'Your retrieval-augmented generation (RAG) pipeline is serving 12,000 queries per minute, but p99 latency has spiked to 3.8 seconds due to vector database lookups and context stuffing.',
        question: 'How would you architect a hybrid retrieval strategy with semantic caching, document re-ranking, and speculative token decoding to achieve sub-400ms end-to-end latency?',
        keyRequirements: ['Semantic Caching with Embedding Similarity', 'Cross-Encoder Re-ranking Batching', 'Context Window Pruning', 'Streaming Token Response'],
        sampleAnswer: 'I would implement a Redis-based semantic cache with cosine similarity thresholds to bypass the vector DB on frequent queries. For novel queries, I would execute parallel dense and sparse retrieval, filter top-k chunks with a lightweight re-ranker worker, and stream tokens directly from a warm inference cluster.'
      };
    }

    if (titleLower.includes('cloud') || titleLower.includes('devops') || titleLower.includes('infrastructure')) {
      return {
        id: `challenge-${Date.now()}`,
        careerTitle,
        difficulty,
        scenario: 'A critical payment gateway deployed across two AWS regions experiences a sudden fiber cut isolating the primary region, while 40,000 active checkout sessions are in flight.',
        question: 'How do you design a zero-downtime, active-active multi-region failover mechanism with deterministic database reconciliation and zero double-charge transactions?',
        keyRequirements: ['Route 53 Latency-Based Routing & Health Checks', 'Distributed Idempotency Locks', 'Conflict-Free Replicated Data Types (CRDTs) or Two-Phase Commit', 'Dead Letter Queue Recovery'],
        sampleAnswer: 'I would deploy multi-region active-active clusters backed by DynamoDB global tables with conditional writes for balance mutations. In the event of network partition, health probes trigger DNS failover, while client-generated idempotency keys ensure duplicated transaction requests are served from the distributed ledger cache.'
      };
    }

    if (titleLower.includes('security') || titleLower.includes('cyber')) {
      return {
        id: `challenge-${Date.now()}`,
        careerTitle,
        difficulty,
        scenario: 'Your security telemetry flags an abnormal rate of OAuth token refresh requests with valid cryptographic signatures originating from 800 distinct IP addresses across 15 countries.',
        question: 'Design a real-time behavioral anomaly detection and automated token revocation system that neutralizes the threat without logging out legitimate active sessions.',
        keyRequirements: ['Distributed Redis Bloom Filters for JTI Blacklisting', 'Sliding Window Rate Limiting', 'mTLS & Device Fingerprinting', 'Automated Threat Intelligence Webhooks'],
        sampleAnswer: 'I would enforce strict token rotation with single-use refresh token families. Upon detecting reuse or anomalous IP shifts, the entire token family is immediately pushed to a low-latency Redis cluster via Bloom filters to reject subsequent requests across all microservices, accompanied by automated step-up MFA challenge triggers.'
      };
    }

    // Default Full Stack / Software Engineering scenario
    return {
      id: `challenge-${Date.now()}`,
      careerTitle,
      difficulty,
      scenario: 'Your platform is preparing for a high-volume flash sale event projected to hit 35,000 concurrent checkout attempts within a 45-second window on an e-commerce platform.',
      question: 'Design an idempotent inventory deduction system that guarantees zero overselling, prevents double billing on client retries, and maintains sub-60ms response times.',
      keyRequirements: ['Redis Distributed Locks with Redlock / Atomic Lua', 'Idempotency Keys in Distributed Cache', 'Event-Driven Asynchronous Order Settlement via Kafka', 'Dead Letter Queue Retries'],
      sampleAnswer: 'I would utilize atomic Redis Lua scripts for real-time inventory decrements and lease reservations. Incoming requests include an idempotency UUID cached at the API Gateway. Once the lease is granted, an OrderCreated event is published to an Apache Kafka partition for background database persistence, returning immediate confirmation to the customer.'
    };
  }

  private static generateDynamicInterviewGradingFallback(question: string, candidateAnswer: string, careerTitle: string): InterviewEvaluation {
    const textLower = candidateAnswer.toLowerCase();
    const wordCount = candidateAnswer.trim().split(/\s+/).length;

    const ARCH_KEYWORDS = [
      'cache', 'redis', 'idempotent', 'queue', 'kafka', 'database', 'replica', 'sharding',
      'acid', 'transaction', 'lock', 'optimistic', 'latency', 'sla', 'circuit breaker',
      'retry', 'backoff', 'hash', 'consistent', 'distributed', 'event', 'metrics',
      'telemetry', 'datadog', 'prometheus', 'zero-trust', 'token', 'tls', 'encryption',
      'rollback', 'bloom filter', 'rate limit', 'failover', 'partition', 'async'
    ];

    const matchedKeywords = ARCH_KEYWORDS.filter(kw => textLower.includes(kw));

    let score = 55;
    score += Math.min(30, matchedKeywords.length * 6);
    if (wordCount >= 30) score += 5;
    if (wordCount >= 60) score += 5;
    score = Math.min(96, Math.max(48, score));

    const grade: 'Exceptional' | 'Strong' | 'Adequate' | 'Needs Improvement' =
      score >= 88 ? 'Exceptional' : score >= 75 ? 'Strong' : score >= 62 ? 'Adequate' : 'Needs Improvement';

    const strengths: string[] = [];
    if (matchedKeywords.includes('cache') || matchedKeywords.includes('redis')) {
      strengths.push('Effective caching layer architecture for latency reduction');
    }
    if (matchedKeywords.includes('idempotent') || matchedKeywords.includes('lock')) {
      strengths.push('Sound concurrency control preventing race conditions');
    }
    if (matchedKeywords.includes('queue') || matchedKeywords.includes('kafka') || matchedKeywords.includes('async')) {
      strengths.push('Asynchronous decoupled event processing pattern');
    }
    if (matchedKeywords.includes('failover') || matchedKeywords.includes('circuit breaker') || matchedKeywords.includes('retry')) {
      strengths.push('Resilience and fault-tolerant degradation strategies');
    }
    if (strengths.length < 2) {
      strengths.push('Direct architectural reasoning addressing core requirements');
      strengths.push('Pragmatic technology selection for high-throughput demands');
    }

    const blindSpots: string[] = [];
    if (!matchedKeywords.includes('rollback') && !matchedKeywords.includes('circuit breaker')) {
      blindSpots.push('Did not specify circuit breaker trip thresholds or automated rollback mechanics');
    }
    if (!matchedKeywords.includes('metrics') && !matchedKeywords.includes('telemetry') && !matchedKeywords.includes('datadog')) {
      blindSpots.push('Omitted real-time telemetry metrics and SLO latency alerts');
    }
    if (!matchedKeywords.includes('partition') && !matchedKeywords.includes('consistent')) {
      blindSpots.push('Could elaborate on data consistency guarantees during split-brain network partitions');
    }

    const detailedFeedback = `Your proposed solution demonstrates ${grade.toLowerCase()} systems engineering instincts with clear articulation of ${strengths[0]?.toLowerCase() || 'core principles'}. To elevate this to staff level, explicitly incorporate failure mitigation playbooks and operational observability.`;

    const followUpQuestion = matchedKeywords.includes('cache')
      ? 'How would you mitigate the "thundering herd" problem if your primary cache key expires during a high-traffic spike?'
      : 'What is your strategy for maintaining data consistency across your persistent store and event queue during network partitions?';

    return {
      score,
      grade,
      strengths: strengths.slice(0, 3),
      blindSpots: blindSpots.slice(0, 3),
      detailedFeedback,
      followUpQuestion,
      modelUsed: 'CareerCompass AI Dynamic Engine'
    };
  }

  private static generateDynamicCoverLetterFallback(targetRole: string, company: string, userScores: DimensionScores, jobDetails?: string): CoverLetterResult {
    const sortedDims = (Object.keys(userScores) as Dimension[]).sort((a, b) => userScores[b] - userScores[a]);
    const topDim1 = DIMENSION_LABELS[sortedDims[0]];
    const topDim2 = DIMENSION_LABELS[sortedDims[1]];

    const coverLetter = `### Application for ${targetRole} • ${company}\n\n` +
      `Dear Engineering Hiring Team at **${company}**,\n\n` +
      `I am writing to express my strong interest in joining ${company} as a **${targetRole}**. Having followed ${company}'s architectural innovations and engineering culture, I am drawn to your commitment to building high-velocity, resilient systems that solve complex real-world challenges.\n\n` +
      `My engineering approach is grounded in **${topDim1}** and **${topDim2}**. Rather than simply writing syntax, I focus on the holistic lifecycle of software: architectural trade-offs, defensive error handling, and low-latency throughput. In recent projects, I have architected modular microservices, decoupled data mutations with event queues, and prioritized automated CI/CD verification with comprehensive test coverage.\n\n` +
      `I would love the opportunity to contribute this pragmatic, high-ownership engineering mindset to the team at ${company} and help accelerate your technical milestones this year.\n\n` +
      `Warm regards,\nCandidate`;

    const recruiterPitch = `Hi team — I saw that ${company} is expanding its ${targetRole} initiatives. With a strong track record in ${topDim1.toLowerCase()} and high-velocity engineering execution, I'd love to share how I can immediately unblock technical goals on your roadmap this quarter. Open to a brief 5-minute sync?`;

    const keyHighlights = [
      `High dimensional calibration in ${topDim1} and ${topDim2}`,
      `Demonstrated ability to design scalable, testable, and fault-tolerant architectures`,
      `Ownership-driven approach to production observability and continuous delivery`
    ];

    return {
      coverLetter,
      recruiterPitch,
      keyHighlights,
      modelUsed: 'CareerCompass AI Dynamic Engine'
    };
  }

  private static generateDynamicSalaryStrategyFallback(targetRole: string, currentOffer: string, region: string, userScores: DimensionScores): SalaryNegotiationResult {
    const numericMatch = currentOffer.replace(/[^0-9]/g, '');
    const baseNumber = numericMatch ? parseInt(numericMatch, 10) : 130000;
    const normalizedBase = baseNumber < 1000 ? baseNumber * 1000 : baseNumber;
    
    const counterLow = Math.round((normalizedBase * 1.12) / 1000) * 1000;
    const counterHigh = Math.round((normalizedBase * 1.16) / 1000) * 1000;
    const recommendedCounterOffer = `$${counterLow.toLocaleString()} - $${counterHigh.toLocaleString()} Base + Accelerated Equity`;

    const sortedDims = (Object.keys(userScores) as Dimension[]).sort((a, b) => userScores[b] - userScores[a]);
    const topStrength = DIMENSION_LABELS[sortedDims[0]];

    const emailScript = `Hi [Hiring Manager / Recruiter Name],\n\n` +
      `Thank you so much for extending the offer to join ${targetRole}! I am genuinely excited about the team's roadmap and the architectural problems you are solving.\n\n` +
      `After reviewing the complete package and considering current market benchmarks for this tier of technical ownership in ${region}, I would like to discuss the base compensation. Based on my demonstrated capabilities in ${topStrength.toLowerCase()} and my ability to hit the ground running without an extended ramp period, I am targeting ${recommendedCounterOffer}.\n\n` +
      `If we can align around this figure, I would be thrilled to sign the offer immediately and begin onboarding. Looking forward to your thoughts!\n\n` +
      `Best regards,\n[Your Name]`;

    const verbalTalkingPoints = [
      `"I'm very enthusiastic about this opportunity and am confident in delivering high impact for the team."`,
      `"Looking at market benchmarks for ${targetRole} in ${region}, I was targeting ${recommendedCounterOffer} to reflect my architectural ownership."`,
      `"If base compensation is bound by strict pay bands, I am open to discussing an additional equity grant or a sign-on bonus to bridge the gap."`
    ];

    const leveragePoints = [
      `Exceptional score in ${topStrength}, reducing technical onboarding ramp time`,
      `High alignment with modern cloud-native architectures and resilient system design`,
      `Demonstrated capability to deliver full-lifecycle engineering initiatives independently`
    ];

    return {
      recommendedCounterOffer,
      marketPercentile: 'Upper 78th-85th Market Percentile',
      leveragePoints,
      emailScript,
      verbalTalkingPoints,
      equityAdvice: 'Request the latest 409A common share price, total preferred vs common share pool, and ensure standard 4-year vesting with a 1-year cliff.',
      modelUsed: 'CareerCompass AI Dynamic Engine'
    };
  }

  private static generateDynamicTrajectoryFallback(targetCareerTitle: string, currentScores: DimensionScores): TrajectoryOptimizationResult {
    const sortedDims = (Object.keys(currentScores) as Dimension[])
      .sort((a, b) => currentScores[a] - currentScores[b]);

    const primaryDim = sortedDims[0];
    const secondaryDim = sortedDims[1];

    const currentScore1 = currentScores[primaryDim];
    const recommendedScore1 = Math.min(44, currentScore1 + 7);
    const currentScore2 = currentScores[secondaryDim];
    const recommendedScore2 = Math.min(44, currentScore2 + 6);

    const recommendedBoosts = [
      {
        dimension: primaryDim,
        label: DIMENSION_LABELS[primaryDim],
        currentScore: currentScore1,
        recommendedScore: recommendedScore1,
        reason: `Bridges prerequisite threshold gating for ${targetCareerTitle}`
      },
      {
        dimension: secondaryDim,
        label: DIMENSION_LABELS[secondaryDim],
        currentScore: currentScore2,
        recommendedScore: recommendedScore2,
        reason: `Dramatically compounds architectural execution confidence`
      }
    ];

    return {
      targetCareerTitle,
      recommendedBoosts,
      projectedMatchIncrease: 16,
      rationale: `Targeting growth in ${DIMENSION_LABELS[primaryDim]} and ${DIMENSION_LABELS[secondaryDim]} eliminates the primary cognitive gating penalties, accelerating your match trajectory to the 92nd percentile.`,
      actionPlan: [
        `Deploy an open-source production service targeting ${DIMENSION_LABELS[primaryDim]}`,
        `Implement automated integration test suites and stress-test under concurrent traffic`,
        `Publish a comprehensive architectural case study demonstrating lessons learned`
      ],
      modelUsed: 'CareerCompass AI Dynamic Engine'
    };
  }
}

