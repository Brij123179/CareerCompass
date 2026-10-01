import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, RotateCcw, TrendingUp, Sparkles, ArrowRight, Zap, Target, CheckCircle2, ChevronRight, BarChart2, Scale, Plus, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Career, SimulatorSkills, MatchBreakdown } from '../types';
import { calculateSimulatorMatch, DEFAULT_SIMULATOR_SKILLS } from '../utils/scoringEngine';
import { CAREERS_DATA } from '../data/careersData';
import { ActiveTab } from './Navbar';
import { MentorService, TrajectoryOptimizationResult } from '../services/mentorService';
import { UserRole } from '../types/security';

interface WhatIfSimulatorProps {
  baselineMatches: MatchBreakdown[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCareerForComparison: (careerId: string) => void;
  onOpenCareerModal: (career: Career) => void;
  currentRole?: UserRole;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baselineMatches,
  setActiveTab,
  onSelectCareerForComparison,
  onOpenCareerModal,
  currentRole = 'student'
}) => {
  const [skills, setSkills] = useState<SimulatorSkills>(DEFAULT_SIMULATOR_SKILLS);
  const [targetCareerId, setTargetCareerId] = useState<string>(baselineMatches[0]?.career.id || 'ai-ml-engineer');
  const [aiOptimization, setAiOptimization] = useState<TrajectoryOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [showAiOptimizer, setShowAiOptimizer] = useState<boolean>(false);

  // Baseline map for delta calculations
  const baselineMap = useMemo(() => {
    const map = new Map<string, { score: number; rank: number }>();
    baselineMatches.forEach((m, idx) => map.set(m.career.id, { score: m.score, rank: idx + 1 }));
    return map;
  }, [baselineMatches]);

  // Recalculate matches across all careers dynamically in real time
  const simulatedResults = useMemo(() => {
    return CAREERS_DATA.map(career => {
      const simScore = calculateSimulatorMatch(career, skills);
      const baselineInfo = baselineMap.get(career.id) || { score: 75, rank: 6 };
      const delta = simScore - baselineInfo.score;
      return {
        career,
        simScore,
        baselineScore: baselineInfo.score,
        baselineRank: baselineInfo.rank,
        delta
      };
    }).sort((a, b) => b.simScore - a.simScore);
  }, [skills, baselineMap]);

  // Target Career Optimization calculation
  const targetCareer = useMemo(() => {
    return CAREERS_DATA.find(c => c.id === targetCareerId) || CAREERS_DATA[0];
  }, [targetCareerId]);

  const targetSimResult = useMemo(() => {
    return simulatedResults.find(r => r.career.id === targetCareerId);
  }, [simulatedResults, targetCareerId]);

  // Reverse solve: Calculate target skills to reach 95% match
  const recommendedSkillsForTarget = useMemo((): SimulatorSkills => {
    const weights = targetCareer.dimensionalWeights;
    return {
      problemSolving: Math.min(100, Math.max(50, weights.problemSolving * 20)),
      technical: Math.min(100, Math.max(50, weights.technical * 20)),
      data: Math.min(100, Math.max(50, weights.data * 20)),
      creativity: Math.min(100, Math.max(50, weights.creative * 20)),
      communication: Math.min(100, Math.max(50, weights.communication * 20)),
      leadership: Math.min(100, Math.max(50, weights.leadership * 20))
    };
  }, [targetCareer]);

  const handleSliderChange = (skillKey: keyof SimulatorSkills, value: number) => {
    setSkills(prev => ({
      ...prev,
      [skillKey]: Math.min(100, Math.max(0, value))
    }));
  };

  const handleIncrement = (skillKey: keyof SimulatorSkills, delta: number) => {
    setSkills(prev => ({
      ...prev,
      [skillKey]: Math.min(100, Math.max(0, prev[skillKey] + delta))
    }));
  };

  const applyTargetRecommendations = () => {
    setSkills(recommendedSkillsForTarget);
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'tech':
        setSkills({
          problemSolving: 95,
          technical: 95,
          data: 75,
          creativity: 50,
          communication: 65,
          leadership: 60
        });
        break;
      case 'data':
        setSkills({
          data: 95,
          problemSolving: 90,
          technical: 85,
          creativity: 45,
          communication: 70,
          leadership: 60
        });
        break;
      case 'creative':
        setSkills({
          creativity: 95,
          communication: 88,
          problemSolving: 75,
          technical: 60,
          leadership: 65,
          data: 45
        });
        break;
      case 'leader':
        setSkills({
          leadership: 95,
          communication: 95,
          problemSolving: 80,
          creativity: 70,
          technical: 55,
          data: 75
        });
        break;
      case 'reset':
        setSkills(DEFAULT_SIMULATOR_SKILLS);
        break;
    }
  };

  const biggestGainer = useMemo(() => {
    return [...simulatedResults].sort((a, b) => b.delta - a.delta)[0];
  }, [simulatedResults]);

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '28px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(2, 132, 199, 0.08) 0%, rgba(79, 70, 229, 0.06) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={13} />
                Real-Time Sensitivity Engine
              </span>
              <span className="badge badge-indigo">
                Dynamic Modeling
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', marginBottom: '8px' }}>What-If Career Simulator</h1>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
              Adjust key skill sliders below to simulate your future skill growth and observe real-time shifts in career match compatibility and market ranking.
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => applyPreset('tech')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              Engineering Focus
            </button>
            <button onClick={() => applyPreset('data')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              AI & Data Focus
            </button>
            <button onClick={() => applyPreset('creative')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              Design Focus
            </button>
            <button onClick={() => applyPreset('leader')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
              Product & Strategy
            </button>
            <button onClick={() => applyPreset('reset')} className="btn-icon" title="Reset to Quiz Baseline">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Target Career Optimizer Box (Brutally Dynamic Feature) */}
      <div className="glass-panel" style={{
        padding: '22px 28px',
        marginBottom: '28px',
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(79, 70, 229, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo)'
            }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Target Career Optimizer</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select your dream role to reverse-engineer the exact skill growth needed for a 95%+ match
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={targetCareerId}
              onChange={(e) => setTargetCareerId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {CAREERS_DATA.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Simulated Match: <strong style={{ color: 'var(--accent-indigo)' }}>{targetSimResult?.simScore}%</strong>
              </span>
              <button
                onClick={applyTargetRecommendations}
                className="btn-primary"
                style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              >
                <Zap size={13} />
                <span>Auto-Apply Target Skills</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (Sliders) vs Right Real-Time Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        
        {/* Left Column: 6 Interactive Skill Sliders */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Interactive Skill Sliders</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live sensitivity controls with step toggles</p>
            </div>
            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>6 Dimensions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* 1. Problem Solving */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Problem Solving & Debugging</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('problemSolving', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    background: 'rgba(2, 132, 199, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.problemSolving}%
                  </span>
                  <button onClick={() => handleIncrement('problemSolving', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.problemSolving}
                onChange={(e) => handleSliderChange('problemSolving', parseInt(e.target.value))}
              />
            </div>

            {/* 2. Technical Skills */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Technical & Coding Aptitude</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('technical', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-indigo)',
                    background: 'rgba(79, 70, 229, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.technical}%
                  </span>
                  <button onClick={() => handleIncrement('technical', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.technical}
                onChange={(e) => handleSliderChange('technical', parseInt(e.target.value))}
              />
            </div>

            {/* 3. Data & Analytics */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Data & Quantitative Analysis</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('data', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    background: 'rgba(2, 132, 199, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.data}%
                  </span>
                  <button onClick={() => handleIncrement('data', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.data}
                onChange={(e) => handleSliderChange('data', parseInt(e.target.value))}
              />
            </div>

            {/* 4. Creativity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Creativity & UI/UX Product Design</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('creativity', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-rose)',
                    background: 'rgba(225, 29, 72, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.creativity}%
                  </span>
                  <button onClick={() => handleIncrement('creativity', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.creativity}
                onChange={(e) => handleSliderChange('creativity', parseInt(e.target.value))}
              />
            </div>

            {/* 5. Communication */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Communication & Presentation</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('communication', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-emerald)',
                    background: 'rgba(5, 150, 105, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.communication}%
                  </span>
                  <button onClick={() => handleIncrement('communication', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.communication}
                onChange={(e) => handleSliderChange('communication', parseInt(e.target.value))}
              />
            </div>

            {/* 6. Leadership */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Leadership & Strategic Vision</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleIncrement('leadership', -5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--accent-amber)',
                    background: 'rgba(217, 119, 6, 0.1)',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '42px',
                    textAlign: 'center'
                  }}>
                    {skills.leadership}%
                  </span>
                  <button onClick={() => handleIncrement('leadership', 5)} className="btn-icon" style={{ width: '24px', height: '24px' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={skills.leadership}
                onChange={(e) => handleSliderChange('leadership', parseInt(e.target.value))}
              />
            </div>

          </div>
        </div>

        {/* Right Column: Real-Time Outcomes */}
        <div>
          
          {/* Top Projected Fit Banner */}
          <div className="glass-panel" style={{
            padding: '24px',
            marginBottom: '20px',
            border: '1px solid var(--border-glow)',
            background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.08) 0%, rgba(2, 132, 199, 0.05) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                Current Top Projected Fit
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {simulatedResults[0].career.category}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', margin: 0 }}>{simulatedResults[0].career.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {simulatedResults[0].career.tagline}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--accent-emerald)',
                  lineHeight: 1
                }}>
                  {simulatedResults[0].simScore}%
                </span>
                {simulatedResults[0].delta !== 0 && (
                  <span style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: simulatedResults[0].delta > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {simulatedResults[0].delta > 0 ? `+${simulatedResults[0].delta}%` : `${simulatedResults[0].delta}%`}
                  </span>
                )}
              </div>
            </div>

            {/* Biggest Gainer Callout */}
            {biggestGainer && biggestGainer.delta > 0 && (
              <div style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}>
                  <TrendingUp size={14} />
                  <strong>Biggest Gainer:</strong> {biggestGainer.career.title}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  +{biggestGainer.delta}% Sensitivity Boost
                </span>
              </div>
            )}
          </div>

          {/* Real-Time Career Roster */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: 'var(--accent-cyan)' }} />
              Live Career Compatibility Shift Matrix
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '430px', overflowY: 'auto', paddingRight: '4px' }}>
              {simulatedResults.map((item, idx) => {
                const rankDelta = item.baselineRank - (idx + 1);
                return (
                  <div
                    key={item.career.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: idx === 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        minWidth: '22px'
                      }}>
                        #{idx + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.career.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.career.category} • {item.career.comparison.avgSalary}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Scores */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <div style={{ width: '65px', height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.simScore}%`,
                          height: '100%',
                          background: item.simScore >= 85 ? 'var(--accent-emerald)' : 'var(--accent-indigo)',
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '40px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: item.simScore >= 85 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                          {item.simScore}%
                        </span>
                        {rankDelta !== 0 && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            fontSize: '0.68rem',
                            color: rankDelta > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                          }}>
                            {rankDelta > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {rankDelta > 0 ? `+${rankDelta}` : `${rankDelta}`}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenCareerModal(item.career)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="View Roadmap"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
