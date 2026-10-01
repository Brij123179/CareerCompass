import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Sparkles, SlidersHorizontal, Scale, MessageSquareCode, Search, 
  Award, TrendingUp, CheckCircle2, BookOpen, Clock, ArrowRight, ShieldCheck, 
  User, Zap, Code2, BrainCircuit, CheckSquare, Square, Layers, Server, 
  Cpu, Database, Terminal, ExternalLink, BarChart3, HelpCircle, Lightbulb,
  RotateCcw, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { MatchBreakdown, DimensionScores, Career, Dimension } from '../types';
import { AuthUser } from '../services/authService';
import { ActiveTab } from './Navbar';
import { LaborMarketService } from '../utils/laborMarketService';
import { ASSESSMENT_TRACKS } from '../data/assessmentTracks';
import { MentorService } from '../services/mentorService';
import { generateDynamicSprintTasks } from '../utils/dynamicCalculationEngine';
import { AIJobMatcher } from './AIJobMatcher';
import { AIMockInterviewer } from './AIMockInterviewer';
import { CAREERS_DATA } from '../data/careersData';

interface StudentDashboardProps {
  user: AuthUser;
  topMatches: MatchBreakdown[];
  userScores: DimensionScores;
  hasCompletedQuiz: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCareerModal: (career: Career) => void;
  onStartTrack?: (trackId: string) => void;
}

interface SprintTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  deliverable: string;
  tags: string[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  topMatches,
  userScores,
  hasCompletedQuiz,
  setActiveTab,
  onOpenCareerModal,
  onStartTrack
}) => {
  const topMatch = topMatches[0];
  const primaryCareer = topMatch?.career || CAREERS_DATA[0];
  const matchScore = topMatch?.score || 88;
  const localizedSalary = primaryCareer 
    ? LaborMarketService.getLocalizedSalary(primaryCareer.comparison.avgSalary) 
    : { formatted: '$120,000 / yr' };

  // AI Suite state
  const [activeAiTool, setActiveAiTool] = useState<'interview' | 'jobMatch'>('interview');
  const [customAiSyllabus, setCustomAiSyllabus] = useState<string | null>(null);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);
  const [showAiSyllabusModal, setShowAiSyllabusModal] = useState(false);

  // Local storage persisted sprint checklist
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`careercompass_tasks_${user.id}`);
      return saved ? JSON.parse(saved) : { 'task-1': true, 'task-2': false, 'task-3': false, 'task-4': false };
    } catch {
      return { 'task-1': true, 'task-2': false, 'task-3': false, 'task-4': false };
    }
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem(`careercompass_tasks_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const sprintTasks = useMemo(() => {
    return generateDynamicSprintTasks(primaryCareer, userScores);
  }, [primaryCareer, userScores]);

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const sprintProgressPercent = Math.round((completedCount / sprintTasks.length) * 100);

  const handleLaunchTrack = (trackId: string) => {
    if (onStartTrack) {
      onStartTrack(trackId);
    } else {
      setActiveTab('quiz');
    }
  };

  const handleGenerateAiSyllabus = async () => {
    setIsGeneratingSyllabus(true);
    try {
      const syllabus = await MentorService.generateCustomSyllabus(primaryCareer.title, userScores);
      setCustomAiSyllabus(syllabus);
      setShowAiSyllabusModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  const getDimensionLevel = (score: number) => {
    if (score >= 38) return { label: 'Mastery / Senior', color: 'var(--accent-emerald)' };
    if (score >= 26) return { label: 'Proficient', color: 'var(--accent-indigo)' };
    if (score >= 16) return { label: 'Developing', color: 'var(--accent-cyan)' };
    return { label: 'Foundational', color: 'var(--text-muted)' };
  };

  const dimensionList: { key: Dimension; name: string }[] = [
    { key: 'technical', name: 'Technical Depth' },
    { key: 'analytical', name: 'Analytical Thinking' },
    { key: 'problemSolving', name: 'Algorithmic Problem Solving' },
    { key: 'technology', name: 'Modern Systems Architecture' },
    { key: 'data', name: 'Data & Quantitative Insights' },
    { key: 'creative', name: 'Creative Synthesis' },
    { key: 'leadership', name: 'Leadership & Autonomy' },
    { key: 'communication', name: 'Technical Communication' },
    { key: 'socialImpact', name: 'Social Impact & Ethics' },
  ];

  return (
    <div style={{ paddingBottom: '90px', paddingTop: '20px' }}>
      
      {/* Student Welcome Hero Panel */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '28px',
        border: '1px solid var(--border-glow)',
        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.09) 0%, rgba(2, 132, 199, 0.06) 100%)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">Student Workspace</span>
              <span className="badge badge-emerald">SQL Backend Synced</span>
              {user.mfaEnabled && <span className="badge badge-cyan">RFC 6238 MFA Active</span>}
              <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                OpenRouter AI Active
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', lineHeight: 1.25 }}>
              Welcome back, <span className="text-gradient">{user.name}</span>
            </h1>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.55 }}>
              Your cognitive assessment profile is synchronized with institutional labor market data. Your highest predicted alignment is <strong>{primaryCareer?.title || 'Full Stack Software Engineer'}</strong> at <strong>{matchScore}% compatibility</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleLaunchTrack('comprehensive')}
              className="btn-primary"
              style={{ fontSize: '0.86rem', padding: '11px 20px' }}
            >
              <Sparkles size={15} />
              <span>{hasCompletedQuiz ? 'Retake Diagnostics' : 'Start Diagnostic'}</span>
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className="btn-secondary"
              style={{ fontSize: '0.86rem', padding: '11px 20px' }}
            >
              <MessageSquareCode size={15} />
              <span>Ask AI Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="card-premium card-accent-indigo" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Top Career Fit</span>
            <Award size={18} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-highlight)', marginBottom: '6px' }}>
            {primaryCareer?.title || 'Software Engineer'}
          </div>
          <div className="match-score-pill match-high" style={{ fontSize: '0.76rem', padding: '3px 10px' }}>
            {matchScore}% Compatibility
          </div>
        </div>

        <div className="card-premium card-accent-emerald" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Calibrated Market Salary</span>
            <TrendingUp size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
            {localizedSalary.formatted}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Growth: {primaryCareer?.comparison.growthOutlook || '+22% (Much faster than avg)'}
          </span>
        </div>

        <div className="card-premium card-accent-cyan" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Curriculum Roadmap</span>
            <BookOpen size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-highlight)', marginBottom: '4px' }}>
            Phase 1: Foundation
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Est. {primaryCareer?.roadmap[0]?.duration || 'Month 1 - 3'}
          </span>
        </div>

        <div className="card-premium card-accent-rose" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security Compliance</span>
            <ShieldCheck size={18} style={{ color: 'var(--accent-violet)' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-violet)', marginBottom: '4px' }}>
            Zero-Trust RBAC
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Student PII strictly isolated
          </span>
        </div>
      </div>

      {/* SECTION 1: Multi-Track Assessment Diagnostic Center */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} style={{ color: 'var(--accent-indigo)' }} />
              <span>Diagnostic Assessment Tracks</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select a specialized assessment calibrated to your current stage, available time, or engineering specialization.
            </p>
          </div>

          <span className="badge badge-indigo">
            4 Specialized Tracks Available
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '18px'
        }}>
          {ASSESSMENT_TRACKS.map(track => {
            return (
              <div 
                key={track.id}
                className="card-premium"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${track.color}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className={`badge ${track.badgeClass}`}>
                      {track.badge}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {track.duration}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-highlight)', marginBottom: '6px' }}>
                    {track.title}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {track.description}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      Target Roles:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {track.targetRole}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>{track.questionsCount}</strong> Questions
                    </span>
                    <button
                      onClick={() => handleLaunchTrack(track.id)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      <span>Launch Track</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LIVE AI ACCELERATION SUITE (Interactive Mock Interviewer & Job Matcher) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} />
                Live Generative AI
              </span>
              <span className="badge badge-indigo">
                Real-Time Inference Suite
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
              Live AI Career Acceleration Suite
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Interactive tools powered by live LLM inference—simulating real technical interviews and semantic job requirement audits.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '3px', border: '1px solid var(--border-medium)' }}>
            <button
              onClick={() => setActiveAiTool('interview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: activeAiTool === 'interview' ? 'var(--accent-indigo)' : 'transparent',
                color: activeAiTool === 'interview' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeAiTool === 'interview' ? 600 : 400,
                transition: 'all var(--transition-fast)'
              }}
            >
              <Terminal size={14} />
              <span>AI System Design Interview</span>
            </button>
            <button
              onClick={() => setActiveAiTool('jobMatch')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: activeAiTool === 'jobMatch' ? 'var(--accent-indigo)' : 'transparent',
                color: activeAiTool === 'jobMatch' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeAiTool === 'jobMatch' ? 600 : 400,
                transition: 'all var(--transition-fast)'
              }}
            >
              <FileText size={14} />
              <span>AI Job Posting Matcher</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tool Rendering */}
        {activeAiTool === 'interview' ? (
          <AIMockInterviewer career={primaryCareer} />
        ) : (
          <AIJobMatcher career={primaryCareer} userScores={userScores} />
        )}
      </div>

      {/* SECTION 3 & 4: Weekly Sprint Tracker & Capstone Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        
        {/* Interactive Weekly Study Sprint Tracker */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.22rem', color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)' }} />
                <span>Active 4-Week Study Sprint</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Tactical milestones tailored for <strong>{primaryCareer?.title || 'Engineering Candidates'}</strong>.
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {completedCount} of {sprintTasks.length} Done ({sprintProgressPercent}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '18px'
          }}>
            <div style={{
              width: `${sprintProgressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-indigo) 0%, var(--accent-emerald) 100%)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>

          {/* Sprint Task Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sprintTasks.map(task => {
              const isChecked = !!completedTasks[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: isChecked ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                    border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isChecked ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{
                        fontSize: '0.9rem',
                        color: isChecked ? 'var(--accent-emerald)' : 'var(--text-highlight)',
                        textDecoration: isChecked ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {task.duration}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '6px' }}>
                      {task.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                        Deliverable: {task.deliverable}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capstone Portfolio Project Blueprint */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.22rem', color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} style={{ color: 'var(--accent-indigo)' }} />
              <span>Capstone Architecture Blueprint</span>
            </h3>
            <span className="badge badge-indigo">
              Phase 1 Deliverable
            </span>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended Project:
            </span>
            <h4 style={{ fontSize: '1.1rem', margin: '4px 0 8px 0', color: 'var(--text-highlight)' }}>
              {primaryCareer?.roadmap[0]?.recommendedProject || 'High-Throughput Distributed Microservice Gateway'}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Engineered to showcase systems thinking, resilient failovers, and production observability to hiring managers.
            </p>
          </div>

          {/* Architecture Tier Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Cpu size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span><strong>Presentation Tier:</strong> React 19, TypeScript, Vanilla CSS Tokens</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Server size={15} style={{ color: 'var(--accent-indigo)' }} />
              <span><strong>Compute & Gateway:</strong> Node.js, RFC 6238 TOTP, Salted SHA-256 Hashing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Database size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span><strong>Data Layer:</strong> SQLite / Postgres Relational Core with In-Memory Caching</span>
            </div>
          </div>

          {/* Live AI Bespoke Syllabus Trigger */}
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={handleGenerateAiSyllabus}
              disabled={isGeneratingSyllabus}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.84rem',
                borderColor: customAiSyllabus ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                background: customAiSyllabus ? 'rgba(16, 185, 129, 0.08)' : 'rgba(2, 132, 199, 0.08)'
              }}
            >
              {isGeneratingSyllabus ? (
                <>
                  <RotateCcw size={14} className="spinner" />
                  <span>Synthesizing Bespoke AI Syllabus...</span>
                </>
              ) : customAiSyllabus ? (
                <>
                  <Sparkles size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span>✨ Bespoke AI Syllabus Active (Click to View)</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <span>✨ Generate Bespoke AI Syllabus (Live LLM)</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => primaryCareer && onOpenCareerModal(primaryCareer)}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.86rem' }}
          >
            <span>View Standard 4-Phase Curriculum</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* AI Bespoke Syllabus Modal / View */}
      {showAiSyllabusModal && customAiSyllabus && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1.5px solid var(--accent-emerald)',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          marginBottom: '36px',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                Live LLM Synthesized
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Targeting your specific lowest diagnostic dimensional scores
              </span>
            </div>

            <button
              onClick={() => setShowAiSyllabusModal(false)}
              className="btn-secondary"
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              Hide AI Syllabus
            </button>
          </div>

          <div style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            padding: '20px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {customAiSyllabus}
          </div>
        </div>
      )}

      {/* SECTION 5: 9-Dimensional Cognitive Profile & AI Consultations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        
        {/* Cognitive Dimensional Snapshot */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.22rem', color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} style={{ color: 'var(--accent-indigo)' }} />
                <span>9-D Cognitive Diagnostic Snapshot</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Calculated from your verified assessment answers across 9 core dimensions.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('results')}
              className="btn-secondary"
              style={{ fontSize: '0.74rem', padding: '6px 12px' }}
            >
              Full Radar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dimensionList.map(({ key, name }) => {
              const score = userScores[key] || 15;
              const percent = Math.min(100, Math.round((score / 45) * 100));
              const level = getDimensionLevel(score);

              return (
                <div key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: level.color, fontWeight: 600 }}>{level.label}</span>
                      <span style={{ color: 'var(--text-highlight)', fontWeight: 700 }}>{score} / 45</span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '5px',
                    background: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, var(--accent-indigo) 0%, ${level.color} 100%)`,
                      borderRadius: 'var(--radius-full)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Career Mentor Consultations & Labor Market Index */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.22rem', color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>AI Mentor Quick Consultations</span>
            </h3>
            <span className="badge badge-cyan">Instant AI Query</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Ask calibrated questions directly to your AI Career Advisor regarding career strategy, salary benchmarks, and interview preparation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              {
                prompt: 'What are the top 3 open-source repositories I should contribute to for this career?',
                tag: 'Open-Source Portfolio'
              },
              {
                prompt: 'Conduct a 5-minute technical system design mock interview with me.',
                tag: 'Mock Interview'
              },
              {
                prompt: 'How do I negotiate a higher base salary with real market data?',
                tag: 'Compensation Playbook'
              },
              {
                prompt: 'What are the biggest skill gaps preventing me from getting hired in this role?',
                tag: 'Gap Analysis'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveTab('mentor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="glass-panel-interactive"
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    "{item.prompt}"
                  </span>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }} />
              </div>
            ))}
          </div>

          {/* Labor Market Live Signals */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Live Labor Market Intelligence:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>94 / 100</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Demand Index</div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>28 Days</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Avg Time-to-Hire</div>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>68%</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Remote Ratio</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 6: Exploration & Matrix Tools Hub */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', color: 'var(--text-highlight)' }}>
          Exploration & Matrix Tools
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div
            onClick={() => setActiveTab('simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            className="glass-panel-interactive"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(2, 132, 199, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <SlidersHorizontal size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--text-highlight)' }}>What-If Skill Simulator</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Adjust 6 core sliders to test real-time career rank shifts</span>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div
            onClick={() => setActiveTab('comparison')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            className="glass-panel-interactive"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(79, 70, 229, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-indigo)'
              }}>
                <Scale size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--text-highlight)' }}>Career Comparison Matrix</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Multi-dimensional side-by-side career evaluation</span>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div
            onClick={() => setActiveTab('explorer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            className="glass-panel-interactive"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)'
              }}>
                <Search size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.94rem', display: 'block', color: 'var(--text-highlight)' }}>Searchable Career Catalog</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Filter by coding intensity, category, and salary</span>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

    </div>
  );
};
