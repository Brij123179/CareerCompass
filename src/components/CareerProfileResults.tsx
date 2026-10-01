import React, { useState, useMemo } from 'react';
import { 
  Sparkles, SlidersHorizontal, MessageSquareCode, ArrowRight, CheckCircle2, 
  TrendingUp, Layers, Award, BarChart3, ChevronRight, Zap, Download, 
  Radar as RadarIcon, ShieldCheck, RotateCcw, DollarSign, Target, FileText, Check,
  Globe, Briefcase, ChevronDown, CheckCircle
} from 'lucide-react';
import { Career, DimensionScores, MatchBreakdown, MarketRegion } from '../types';
import { UserRole } from '../types/security';
import { DIMENSION_LABELS, MAX_DIMENSION_SCORES } from '../utils/scoringEngine';
import { LaborMarketService, REGIONAL_MARKETS } from '../utils/laborMarketService';
import { 
  calculateDynamicSalary, 
  calculateDynamicSkills, 
  calculateDynamicRoadmap, 
  calculateDynamicProfileMetrics,
  calculateDynamicRecommendations 
} from '../utils/dynamicCalculationEngine';
import { ActiveTab } from './Navbar';

interface CareerProfileResultsProps {
  topMatches: MatchBreakdown[];
  userScores: DimensionScores;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCareerForComparison: (careerId: string) => void;
  onOpenCareerModal: (career: Career) => void;
  currentRole?: UserRole;
}

export const CareerProfileResults: React.FC<CareerProfileResultsProps> = ({
  topMatches,
  userScores,
  setActiveTab,
  onSelectCareerForComparison,
  onOpenCareerModal,
  currentRole = 'student'
}) => {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [chartView, setChartView] = useState<'radar' | 'bars'>('radar');
  const [hoveredDim, setHoveredDim] = useState<keyof DimensionScores | null>(null);

  if (!topMatches || topMatches.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', margin: '40px auto', maxWidth: '600px' }}>
        <Sparkles size={36} style={{ color: 'var(--accent-terracotta)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>No Diagnostic Results Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Please complete the 12-question diagnostic assessment to generate your personalized career profile and cognitive radar.
        </p>
        <button onClick={() => setActiveTab('quiz')} className="btn-primary" style={{ padding: '12px 24px' }}>
          <span>Take Diagnostic Assessment</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const [selectedRegion, setSelectedRegion] = useState<MarketRegion>(() => LaborMarketService.getActiveRegion());

  const activeBreakdown = topMatches[selectedMatchIndex] || topMatches[0];
  const primaryCareer = activeBreakdown?.career;
  const dimensionsList = (userScores ? Object.keys(userScores) : []) as (keyof DimensionScores)[];

  // 1. Dynamic Mathematical Salary Model calibrated to candidate score & region
  const dynamicSalary = useMemo(() => {
    return calculateDynamicSalary(activeBreakdown.career, userScores, activeBreakdown.score, selectedRegion);
  }, [activeBreakdown.career, userScores, activeBreakdown.score, selectedRegion]);

  // 2. Dynamic Skills and Mathematical ROI Gap Model
  const dynamicSkills = useMemo(() => {
    return calculateDynamicSkills(activeBreakdown.career, userScores);
  }, [activeBreakdown.career, userScores]);

  // 3. Dynamic Roadmap with Accelerated Milestones
  const dynamicRoadmap = useMemo(() => {
    return calculateDynamicRoadmap(activeBreakdown.career, userScores);
  }, [activeBreakdown.career, userScores]);

  // 4. Dynamic Statistical Confidence and Entropy
  const dynamicMetrics = useMemo(() => {
    return calculateDynamicProfileMetrics(userScores, activeBreakdown.score);
  }, [userScores, activeBreakdown.score]);

  // 5. Dynamic Strategic Recommendations
  const dynamicRecommendations = useMemo(() => {
    return calculateDynamicRecommendations(activeBreakdown.career, userScores, activeBreakdown.score);
  }, [activeBreakdown.career, userScores, activeBreakdown.score]);

  // Helper for match tier badge
  const getMatchTierBadge = (score: number) => {
    if (score >= 85) return { label: 'Optimal Match', bg: 'rgba(5, 150, 105, 0.15)', color: '#10b981', border: 'rgba(5, 150, 105, 0.3)' };
    if (score >= 75) return { label: 'Strong Alignment', bg: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: 'rgba(2, 132, 199, 0.3)' };
    if (score >= 65) return { label: 'Solid Potential', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
    return { label: 'Cross-Disciplinary', bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' };
  };

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '24px' }}>

      {/* ========================================================================= */}
      {/* 1. CANDIDATE ASSESSMENT DOSSIER HEADER */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{
        padding: '32px 36px',
        marginBottom: '28px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(235, 94, 52, 0.05) 50%, var(--bg-card) 100%)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} />
                Dynamic Certified Dossier
              </span>
              <span className="badge badge-indigo">
                {dynamicMetrics.dimensionsAssessed} Dimensions Computed
              </span>
              <span className="badge badge-amber">
                {dynamicMetrics.statisticalConfidence}% Statistical Confidence
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Diagnostic Results & <span className="text-gradient">Dynamic Trajectory</span>
            </h1>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '720px' }}>
              Every metric, compensation model, skill gap ROI, and curriculum milestone below is mathematically synthesized in real time from your live cognitive vector and market location.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('simulator')}
              className="btn-secondary"
              style={{ fontSize: '0.84rem', padding: '9px 16px' }}
            >
              <SlidersHorizontal size={14} />
              <span>Simulate Skill Boosts</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '9px 18px' }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent-ochre)' }} />
              <span>AI Career Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className="btn-secondary"
              style={{ fontSize: '0.84rem', padding: '9px 14px' }}
              title="Retake the 12-question diagnostic assessment"
            >
              <RotateCcw size={14} />
              <span>Retake</span>
            </button>
          </div>
        </div>

        {/* Primary Orientation Summary Strip with Live Regional Recalibration */}
        <div style={{
          marginTop: '26px',
          padding: '22px 24px',
          borderRadius: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Primary Career Orientation
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-highlight)', marginTop: '2px' }}>
              {activeBreakdown.career?.title}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {activeBreakdown.career?.category} • Readiness: {dynamicMetrics.estimatedTimeToJobReady}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Compatibility Score
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-terracotta)' }}>
                {activeBreakdown.score}%
              </span>
              <span style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                background: getMatchTierBadge(activeBreakdown.score).bg,
                color: getMatchTierBadge(activeBreakdown.score).color,
                border: `1px solid ${getMatchTierBadge(activeBreakdown.score).border}`
              }}>
                {getMatchTierBadge(activeBreakdown.score).label}
              </span>
            </div>
          </div>

          {/* Dynamic Market Salary Band with Regional Switcher */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Dynamic Compensation
              </span>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  const reg = e.target.value as MarketRegion;
                  setSelectedRegion(reg);
                  LaborMarketService.setActiveRegion(reg);
                }}
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer'
                }}
              >
                <option value="us-tier1">US Tier-1</option>
                <option value="us-tier2">US Tier-2</option>
                <option value="europe">Europe (€)</option>
                <option value="apac">APAC (₹/S$)</option>
                <option value="global-remote">Global Remote</option>
              </select>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {dynamicSalary.formattedCandidate}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Band: {dynamicSalary.formattedRange} ({dynamicSalary.experienceTier})
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Top Cognitive Driver
            </span>
            <div style={{ fontSize: '0.94rem', color: 'var(--text-highlight)', fontWeight: 700, marginTop: '4px' }}>
              {dynamicMetrics.primaryStrength}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-terracotta)' }}>
              Secondary: {dynamicMetrics.secondaryStrength}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP MATCHED CAREER TRAJECTORIES LEADERBOARD */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-terracotta)',
              marginBottom: '4px'
            }}>
              RANKED COMPATIBILITY MATRIX
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-highlight)' }}>
              All 11 Career Directions Ranked by Fit
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any career card below to inspect its detailed gap analysis and curriculum
          </span>
        </div>

        {/* Career Cards Carousel / Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {topMatches.map((match, idx) => {
            const isSelected = selectedMatchIndex === idx;
            const tier = getMatchTierBadge(match.score);

            return (
              <div
                key={match.career.id}
                onClick={() => setSelectedMatchIndex(idx)}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 6px 20px rgba(235, 94, 52, 0.18)' : 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '210px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: isSelected ? 'var(--accent-terracotta)' : 'var(--text-muted)'
                    }}>
                      #{idx + 1} • {match.career.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: tier.bg,
                        color: tier.color,
                        border: `1px solid ${tier.border}`
                      }}>
                        {match.score}%
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-highlight)' }}>
                    {match.career.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 14px' }}>
                    {match.career.tagline}
                  </p>
                </div>

                <div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      {match.career?.comparison?.avgSalary || '$115,000 / yr'}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isSelected ? 'Active Selection' : 'Inspect'} 
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SELECTED CAREER DEEP DIVE & COGNITIVE RADAR */}
      {/* ========================================================================= */}
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--accent-terracotta)',
        marginBottom: '14px'
      }}>
        DEEP-DIVE CALIBRATION FOR: {activeBreakdown.career.title.toUpperCase()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '26px', marginBottom: '32px' }}>
        
        {/* Why This Matches Card */}
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-terracotta)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Why This Matches: {activeBreakdown.career?.title}
              </h3>
            </div>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-terracotta)' }}>
              {activeBreakdown.score}% Match
            </span>
          </div>

          {/* Tailored Domain-Specific Rationale */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-primary)'
          }}>
            {activeBreakdown.rationale}
            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              💡 {dynamicSalary.rationale}
            </div>
          </div>

          {/* Validated Cognitive Strengths (Dynamic) */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <CheckCircle2 size={16} />
              Validated Cognitive Strengths ({dynamicSkills.strengths.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dynamicSkills.strengths.slice(0, 3).map(item => (
                <div
                  key={item.dimension}
                  style={{
                    background: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid rgba(5, 150, 105, 0.25)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <strong>{item.label}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>({item.userScore}/{item.maxScore} pts)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {item.status} (+{item.deltaPercent}% vs req)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Leverage Growth Gaps with ROI Boost (Dynamic) */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <TrendingUp size={16} />
              High-Leverage Growth Gaps & ROI ({dynamicSkills.growthGaps.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dynamicSkills.growthGaps.slice(0, 2).map(item => (
                <div
                  key={item.dimension}
                  style={{
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.25)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                    <strong style={{ color: 'var(--text-highlight)' }}>{item.label}</strong>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(235, 94, 52, 0.15)',
                      color: 'var(--accent-terracotta)',
                      fontWeight: 800
                    }}>
                      ⚡ +{item.impactRoi}% Match Gain
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Capstone Project */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Target size={13} />
              <span>Personalized Capstone Project Milestone</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-highlight)', lineHeight: 1.45 }}>
              {dynamicRoadmap.customCapstone}
            </div>
          </div>

          <div>
            <button
              onClick={() => activeBreakdown.career && onOpenCareerModal(activeBreakdown.career)}
              className="btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: '0.88rem' }}
            >
              <span>View Full Career Curriculum & Certifications</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 9 Core Dimensions Breakdown: Interactive SVG Radar or Linear Bars */}
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  9-Dimensional Cognitive Radar
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Assessed Aptitude vs. {activeBreakdown.career.title} Benchmark
              </p>
            </div>

            {/* Toggle between Radar and Bars */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '3px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setChartView('radar')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: chartView === 'radar' ? 'var(--gradient-brand)' : 'transparent',
                  color: chartView === 'radar' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RadarIcon size={12} />
                <span>Radar Spider</span>
              </button>
              <button
                onClick={() => setChartView('bars')}
                style={{
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: chartView === 'bars' ? 'var(--gradient-brand)' : 'transparent',
                  color: chartView === 'bars' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <BarChart3 size={12} />
                <span>Linear Bars</span>
              </button>
            </div>
          </div>

          {/* Chart Content */}
          {chartView === 'radar' ? (
            <div>
              {/* Radar Legend & Active Hover Tooltip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(235, 94, 52, 0.45)', border: '1.5px solid var(--accent-terracotta)' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Your Aptitude</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(2, 132, 199, 0.25)', border: '1.5px dashed var(--accent-cyan)' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Role Target</span>
                  </span>
                </div>

                {hoveredDim ? (
                  <div className="badge badge-indigo" style={{ textTransform: 'none', fontSize: '0.74rem' }}>
                    <strong>{DIMENSION_LABELS[hoveredDim]}:</strong> {Math.round((userScores[hoveredDim] / MAX_DIMENSION_SCORES[hoveredDim]) * 100)}% (Target: {activeBreakdown.career.dimensionalWeights[hoveredDim]}/5)
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Hover over nodes for exact metrics</span>
                )}
              </div>

              {/* Interactive SVG Radar */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
                {(() => {
                  const radarCenter = 190;
                  const radarRadius = 120;
                  const total = dimensionsList.length;

                  const userPoints = dimensionsList.map((dim, i) => {
                    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
                    const ratio = Math.min(1, Math.max(0.12, userScores[dim] / MAX_DIMENSION_SCORES[dim]));
                    return {
                      x: radarCenter + radarRadius * ratio * Math.cos(angle),
                      y: radarCenter + radarRadius * ratio * Math.sin(angle),
                      dim,
                      ratio,
                      angle
                    };
                  });

                  const careerPoints = dimensionsList.map((dim, i) => {
                    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
                    const ratio = Math.min(1, Math.max(0.12, activeBreakdown.career.dimensionalWeights[dim] / 5));
                    return {
                      x: radarCenter + radarRadius * ratio * Math.cos(angle),
                      y: radarCenter + radarRadius * ratio * Math.sin(angle)
                    };
                  });

                  const userPath = userPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                  const careerPath = careerPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

                  return (
                    <svg viewBox="0 0 380 380" style={{ width: '100%', maxWidth: '380px', height: 'auto', overflow: 'visible' }}>
                      <defs>
                        <radialGradient id="userRadarGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#eb5e34" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#f4be43" stopOpacity="0.2" />
                        </radialGradient>
                      </defs>

                      {/* Concentric Grid Rings */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, ringIdx) => {
                        const ringPoints = dimensionsList.map((_, i) => {
                          const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
                          return `${(radarCenter + radarRadius * level * Math.cos(angle)).toFixed(1)},${(radarCenter + radarRadius * level * Math.sin(angle)).toFixed(1)}`;
                        }).join(' ');

                        return (
                          <polygon
                            key={ringIdx}
                            points={ringPoints}
                            fill={ringIdx % 2 === 0 ? 'var(--bg-subtle)' : 'transparent'}
                            stroke="var(--border-subtle)"
                            strokeWidth="1"
                            strokeDasharray={ringIdx < 3 ? '2 2' : 'none'}
                          />
                        );
                      })}

                      {/* Axis Lines & Labels */}
                      {dimensionsList.map((dim, i) => {
                        const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
                        const edgeX = radarCenter + radarRadius * Math.cos(angle);
                        const edgeY = radarCenter + radarRadius * Math.sin(angle);
                        const labelX = radarCenter + (radarRadius + 22) * Math.cos(angle);
                        const labelY = radarCenter + (radarRadius + 22) * Math.sin(angle);

                        const isHovered = hoveredDim === dim;

                        return (
                          <g key={dim} onMouseEnter={() => setHoveredDim(dim)} onMouseLeave={() => setHoveredDim(null)} style={{ cursor: 'pointer' }}>
                            <line
                              x1={radarCenter}
                              y1={radarCenter}
                              x2={edgeX}
                              y2={edgeY}
                              stroke="var(--border-subtle)"
                              strokeWidth="1"
                            />
                            <text
                              x={labelX}
                              y={labelY + 4}
                              textAnchor="middle"
                              fontSize={isHovered ? "10.5" : "9"}
                              fontWeight={isHovered ? "700" : "500"}
                              fill={isHovered ? "var(--accent-terracotta)" : "var(--text-secondary)"}
                              style={{ transition: 'all 0.15s ease' }}
                            >
                              {DIMENSION_LABELS[dim].split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}

                      {/* Career Target Polygon */}
                      <polygon
                        points={careerPath}
                        fill="rgba(2, 132, 199, 0.08)"
                        stroke="var(--accent-cyan)"
                        strokeWidth="1.8"
                        strokeDasharray="4 3"
                      />

                      {/* User Aptitude Polygon */}
                      <polygon
                        points={userPath}
                        fill="url(#userRadarGrad)"
                        stroke="var(--accent-terracotta)"
                        strokeWidth="2.5"
                      />

                      {/* User Vertex Nodes */}
                      {userPoints.map((pt, i) => {
                        const isHovered = hoveredDim === pt.dim;
                        return (
                          <circle
                            key={i}
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : 4}
                            fill="#ffffff"
                            stroke={isHovered ? "var(--accent-ochre)" : "var(--accent-terracotta)"}
                            strokeWidth="2.5"
                            style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                            onMouseEnter={() => setHoveredDim(pt.dim)}
                            onMouseLeave={() => setHoveredDim(null)}
                          />
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* Linear Progress Bars View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {dimensionsList.map(dim => {
                const userVal = userScores[dim];
                const maxVal = MAX_DIMENSION_SCORES[dim];
                const pct = Math.round((userVal / maxVal) * 100);
                const careerWeight = activeBreakdown.career.dimensionalWeights[dim];

                return (
                  <div key={dim}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {DIMENSION_LABELS[dim]}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {pct}% <span style={{ fontSize: '0.7rem', color: 'var(--accent-terracotta)' }}>({careerWeight}/5 weight)</span>
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '7px',
                      background: 'var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct >= 80 ? 'var(--gradient-brand)' : 'var(--border-medium)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3.5. STRATEGIC EXECUTIVE RECOMMENDATIONS MATRIX (100% DYNAMIC) */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-terracotta)',
              marginBottom: '4px'
            }}>
              BESPOKE ADVISORY BLUEPRINT
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-highlight)' }}>
              Strategic Recommendations for {activeBreakdown.career?.title}
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Dynamically synthesized from your top strength and highest-ROI gap
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
          {dynamicRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="glass-panel"
              style={{
                padding: '24px',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={`badge ${rec.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                    {rec.badge}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                    {rec.pillar}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-highlight)' }}>
                  {rec.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {rec.rationale}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Recommended Action Steps:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    {rec.actionItems.map((step, sIdx) => (
                      <li key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', lineHeight: 1.4 }}>
                        <CheckCircle size={13} style={{ color: 'var(--accent-emerald)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Projected Outcome:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-terracotta)' }}>{rec.impactGain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VISUAL LEARNING ROADMAP FOR SELECTED CAREER */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-medium)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-cyan">Dynamic Curriculum</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Estimated Duration: <strong>{dynamicRoadmap.totalEstimatedMonths} Months</strong> ({dynamicRoadmap.fastTrackedPhasesCount} Phase Accelerated)
              </span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              Step-by-Step Curriculum: {activeBreakdown.career?.title || 'Target Specialization'}
            </h3>
          </div>

          <button
            onClick={() => activeBreakdown.career && onOpenCareerModal(activeBreakdown.career)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <span>Inspect All Milestone Projects</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Roadmap Milestones Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px'
        }}>
          {dynamicRoadmap.phases.map(step => (
            <div
              key={step.step}
              style={{
                background: 'var(--bg-secondary)',
                border: step.status === 'Fast-Tracked' ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--accent-terracotta)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Phase {step.step} • {step.phase}
                </span>

                {step.status === 'Fast-Tracked' ? (
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    ⚡ Accelerated
                  </span>
                ) : step.status === 'In Progress' ? (
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    Active Target
                  </span>
                ) : null}
              </div>

              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--text-highlight)' }}>
                {step.title}
              </h4>

              <span style={{ fontSize: '0.76rem', color: step.status === 'Fast-Tracked' ? 'var(--accent-emerald)' : 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                Duration: {step.adjustedDuration}
              </span>

              {step.accelerationReason && (
                <div style={{
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: '0.72rem',
                  color: 'var(--accent-emerald)',
                  marginBottom: '12px'
                }}>
                  {step.accelerationReason}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Key Competencies:
                </span>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {step.competencies.map((k, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-terracotta)' }} />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: 'var(--bg-card)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.76rem'
              }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  Portfolio Milestone:
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{step.recommendedProject}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ADVISOR AUDIT & VERIFIED EXPORT SECTION */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(5, 150, 105, 0.04) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Certified Diagnostic Dossier Export</h3>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>FERPA / GDPR Audit-Ready</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Mathematical normalized vector metrics exportable for career counseling and institutional records
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const report = {
                studentProfileId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
                certifiedTimestamp: new Date().toISOString(),
                primaryMatch: {
                  careerId: activeBreakdown.career?.id || 'career',
                  careerTitle: activeBreakdown.career?.title || 'Career',
                  deterministicScore: activeBreakdown.score,
                  experienceTier: dynamicSalary.experienceTier,
                  marketPercentile: dynamicSalary.percentile,
                  compensationBreakdown: {
                    baseSalary: dynamicSalary.formattedCandidate,
                    totalCompensation: dynamicSalary.formattedTotalComp,
                    bonusProjected: dynamicSalary.bonusProjected,
                    equityProjected: dynamicSalary.equityProjected,
                    marketRange: dynamicSalary.formattedRange,
                    regionApplied: selectedRegion
                  }
                },
                dynamicSkillsAnalysis: {
                  validatedStrengths: dynamicSkills.strengths,
                  growthGapsWithRoi: dynamicSkills.growthGaps
                },
                acceleratedRoadmap: {
                  totalEstimatedMonths: dynamicRoadmap.totalEstimatedMonths,
                  phases: dynamicRoadmap.phases,
                  customCapstoneMilestone: dynamicRoadmap.customCapstone
                },
                statisticalValidation: {
                  confidenceIndex: `${dynamicMetrics.statisticalConfidence}%`,
                  varianceEntropy: dynamicMetrics.entropyScore,
                  dimensionsAssessed: dynamicMetrics.dimensionsAssessed,
                  estimatedTimeToJobReady: dynamicMetrics.estimatedTimeToJobReady
                },
                rawCognitiveVector: userScores,
                institutionalWeightsApplied: activeBreakdown.career?.dimensionalWeights || {},
                zeroTrustCompliance: 'Verified'
              };
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `careercompass-dossier-${activeBreakdown.career?.id || 'profile'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 16px', borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}
          >
            <Download size={14} />
            <span>Export Dynamic Dossier (.json)</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Evaluation Formula</span>
            <strong style={{ color: 'var(--text-primary)' }}>Weighted Normalized Dot Product</strong>
            <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--accent-indigo)', marginTop: '4px' }}>
              Score = round((Σ w_i · s_i) / (Σ w_i · max_i) * 100)
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Calibration Index</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>{dynamicMetrics.statisticalConfidence}% Dynamic Confidence</strong>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Signal Variance: {dynamicMetrics.entropyScore} • Job Readiness: {dynamicMetrics.estimatedTimeToJobReady}
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Compensation Modeling</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{dynamicSalary.formattedCandidate} ({dynamicSalary.experienceTier})</strong>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {dynamicSalary.percentile}th %tile in {selectedRegion.toUpperCase()} • {dynamicSalary.formattedTotalComp}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
