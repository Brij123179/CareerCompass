import { StudentProfile, DimensionScores } from '../types';
import { CAREERS_DATA } from '../data/careersData';
import { calculateCareerMatch } from '../utils/scoringEngine';

const DEFAULT_SAMPLE_STUDENTS: StudentProfile[] = [
  {
    id: 'STU-108291',
    name: 'Maya Lin',
    email: 'maya.lin@mit.edu',
    cohortYear: 'Class of 2026',
    targetCareerId: 'ai-ml-engineer',
    scores: {
      technical: 22,
      analytical: 24,
      creative: 14,
      communication: 16,
      leadership: 12,
      problemSolving: 23,
      data: 24,
      technology: 20,
      socialImpact: 15
    },
    notes: 'Exceptional quantitative and linear algebra aptitude. Recommended for deep reinforcement learning or computer vision.',
    verifiedAt: '2026-09-28T14:32:00.000Z'
  },
  {
    id: 'STU-108292',
    name: 'Jordan Reed',
    email: 'jreed@berkeley.edu',
    cohortYear: 'Class of 2026',
    targetCareerId: 'fullstack-engineer',
    scores: {
      technical: 24,
      analytical: 19,
      creative: 17,
      communication: 18,
      leadership: 15,
      problemSolving: 22,
      data: 16,
      technology: 23,
      socialImpact: 14
    },
    notes: 'Strong full-stack builder with proactive open-source contributions. High velocity on React/Node microservices.',
    verifiedAt: '2026-09-29T10:15:00.000Z'
  },
  {
    id: 'STU-108293',
    name: 'Sophia Vance',
    email: 'svance@rhodeisland.edu',
    cohortYear: 'Class of 2027',
    targetCareerId: 'ui-ux-designer',
    scores: {
      technical: 13,
      analytical: 14,
      creative: 24,
      communication: 23,
      leadership: 18,
      problemSolving: 19,
      data: 12,
      technology: 15,
      socialImpact: 21
    },
    notes: 'Outstanding user empathy, interaction design, and design system governance. Bridges design and engineering seamlessly.',
    verifiedAt: '2026-09-29T16:45:00.000Z'
  },
  {
    id: 'STU-108294',
    name: 'Marcus Chen',
    email: 'mchen@cmu.edu',
    cohortYear: 'Class of 2026',
    targetCareerId: 'cybersecurity-analyst',
    scores: {
      technical: 23,
      analytical: 22,
      creative: 11,
      communication: 14,
      leadership: 13,
      problemSolving: 24,
      data: 18,
      technology: 24,
      socialImpact: 17
    },
    notes: 'Rigorous security mindset with CTF achievements. Strong understanding of network protocols and kernel internals.',
    verifiedAt: '2026-09-30T09:20:00.000Z'
  },
  {
    id: 'STU-108295',
    name: 'Elena Rostova',
    email: 'elena.rostova@stanford.edu',
    cohortYear: 'Class of 2026',
    targetCareerId: 'tech-product-manager',
    scores: {
      technical: 17,
      analytical: 20,
      creative: 19,
      communication: 24,
      leadership: 24,
      problemSolving: 21,
      data: 19,
      technology: 18,
      socialImpact: 20
    },
    notes: 'Natural strategic leadership and stakeholder diplomacy. Highly adept at translating business requirements into tech specs.',
    verifiedAt: '2026-09-30T11:50:00.000Z'
  }
];

export interface CohortAnalytics {
  totalStudents: number;
  averageScores: DimensionScores;
  careerDistribution: { careerTitle: string; count: number; percentage: number }[];
  cohortTopAptitude: string;
  identifiedBottlenecks: { dimension: string; avgPct: number; recommendation: string }[];
}

export class CohortService {
  private static STORAGE_KEY = 'careercompass_cohort_students';

  static getStudents(): StudentProfile[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cohort students from localStorage', e);
        }
      }
      // Initialize with default sample students
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_STUDENTS));
    }
    return DEFAULT_SAMPLE_STUDENTS;
  }

  static addStudent(data: Omit<StudentProfile, 'id' | 'verifiedAt'>): StudentProfile {
    const students = this.getStudents();
    const newStudent: StudentProfile = {
      ...data,
      id: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      verifiedAt: new Date().toISOString()
    };
    students.unshift(newStudent);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    }
    return newStudent;
  }

  static removeStudent(id: string): void {
    const students = this.getStudents().filter(s => s.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    }
  }

  static getAnalytics(): CohortAnalytics {
    const students = this.getStudents();
    const total = students.length || 1;

    const avg: DimensionScores = {
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

    const careerCountMap: Record<string, number> = {};

    students.forEach(s => {
      // Accumulate scores
      (Object.keys(avg) as (keyof DimensionScores)[]).forEach(dim => {
        avg[dim] += (s.scores[dim] || 0) / total;
      });

      // Compute student's top match
      let bestCareer = CAREERS_DATA[0].title;
      let highestScore = 0;
      CAREERS_DATA.forEach(career => {
        const score = calculateCareerMatch(career, s.scores);
        if (score > highestScore) {
          highestScore = score;
          bestCareer = career.title;
        }
      });

      careerCountMap[bestCareer] = (careerCountMap[bestCareer] || 0) + 1;
    });

    // Round averages
    (Object.keys(avg) as (keyof DimensionScores)[]).forEach(dim => {
      avg[dim] = Math.round(avg[dim] * 10) / 10;
    });

    const careerDistribution = Object.entries(careerCountMap).map(([careerTitle, count]) => ({
      careerTitle,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);

    // Identify cohort bottlenecks (dimensions with lowest average score relative to 24 max)
    const bottlenecks = [
      { dimension: 'Creative & UI/UX', avgPct: Math.round((avg.creative / 24) * 100), recommendation: 'Incorporate design thinking workshops into technical sprints.' },
      { dimension: 'Communication & Storytelling', avgPct: Math.round((avg.communication / 24) * 100), recommendation: 'Require weekly technical demo presentations and architectural design docs.' },
      { dimension: 'Cloud & Modern Tech Stacks', avgPct: Math.round((avg.technology / 24) * 100), recommendation: 'Assign hands-on AWS/Docker containerization milestone projects.' }
    ].sort((a, b) => a.avgPct - b.avgPct);

    return {
      totalStudents: total,
      averageScores: avg,
      careerDistribution,
      cohortTopAptitude: 'Problem Solving & Systems Architecture',
      identifiedBottlenecks: bottlenecks
    };
  }

  static exportDatabase(): string {
    const students = this.getStudents();
    return JSON.stringify({
      schemaVersion: '2.0-ENTERPRISE',
      exportedAt: new Date().toISOString(),
      institution: 'CareerCompass Academic Consortium',
      students
    }, null, 2);
  }

  static importDatabase(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.students || !Array.isArray(parsed.students)) {
        return { success: false, count: 0, error: 'Invalid database schema: missing students array' };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed.students));
      }
      return { success: true, count: parsed.students.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e.message || 'Malformed JSON' };
    }
  }
}
