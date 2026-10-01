export type Dimension = 
  | 'technical'
  | 'analytical'
  | 'creative'
  | 'communication'
  | 'leadership'
  | 'problemSolving'
  | 'data'
  | 'technology'
  | 'socialImpact';

export type DimensionScores = Record<Dimension, number>;

export type CareerCategory = 
  | 'Engineering' 
  | 'Data & AI' 
  | 'Design' 
  | 'Business & Strategy' 
  | 'Security & Cloud';

export interface QuizOption {
  id: string;
  text: string;
  icon?: string;
  description?: string;
  weights: Partial<Record<Dimension, number>>;
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  scenario: string;
  options: QuizOption[];
}

export interface RoadmapStep {
  step: number;
  phase: string;
  title: string;
  duration: string;
  keySkills: string[];
  recommendedProject: string;
  certificationOrResource: string;
}

export interface CareerComparisonData {
  codingLevel: 'High' | 'Moderate' | 'Low' | 'None';
  analyticalSkills: 'High' | 'Moderate' | 'Low';
  creativity: 'High' | 'Moderate' | 'Low';
  communication: 'High' | 'Moderate' | 'Low';
  duration: string;
  typicalRoles: string[];
  avgSalary: string;
  growthOutlook: string;
  workStyle: string;
  topTools: string[];
}

export interface CareerCourse {
  name: string;
  provider: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | string;
  duration: string;
  badge?: string;
}

export interface Career {
  id: string;
  title: string;
  category: CareerCategory;
  tagline: string;
  description: string;
  accentColor: string;
  icon: string;
  dimensionalWeights: DimensionScores;
  prerequisites?: Partial<Record<Dimension, number>>;
  comparison: CareerComparisonData;
  roadmap: RoadmapStep[];
  courses: CareerCourse[];
  skillsRequired: string[];
  emergingTrends: string[];
}

export interface PrerequisiteAlert {
  dimension: Dimension;
  label: string;
  requiredThreshold: number;
  actualScore: number;
  deficitRatio: number;
  penaltyPercentage: number;
}

export interface MatchBreakdown {
  score: number;
  rawLinearScore: number;
  nonlinearPenaltyPct: number;
  prerequisiteAlerts: PrerequisiteAlert[];
  career: Career;
  userAttributesMatched: string[];
  skillsAlreadyShow: { dimension: Dimension; label: string; score: number; max: number }[];
  skillsCanDevelop: { dimension: Dimension; label: string; userScore: number; requiredWeight: number }[];
  rationale: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  suggestions?: string[];
}

export interface SimulatorSkills {
  problemSolving: number;
  communication: number;
  technical: number;
  creativity: number;
  leadership: number;
  data: number;
}

export type MarketRegion = 'us-tier1' | 'us-tier2' | 'europe' | 'apac' | 'global-remote';

export interface RegionalMarketInfo {
  region: MarketRegion;
  label: string;
  currencySymbol: string;
  currencyCode: string;
  salaryMultiplier: number;
  typicalSalaryRange: string;
  hiringGrowthRate: string;
  marketHeatIndex: number; // 0 to 100
  topHubs: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  cohortYear: string;
  targetCareerId?: string;
  scores: DimensionScores;
  notes?: string;
  verifiedAt: string;
}
