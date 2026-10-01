import React, { useState, useMemo } from 'react';
import { Scale, Check, Plus, X, Sparkles, ArrowRight, Shield, Code, Brain, Palette, MessageSquare, Clock, Users, DollarSign, Wrench, Award, CheckCircle2 } from 'lucide-react';
import { Career, MatchBreakdown } from '../types';
import { CAREERS_DATA } from '../data/careersData';
import { ActiveTab } from './Navbar';

interface CareerComparisonTableProps {
  baselineMatches: MatchBreakdown[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCareerModal: (career: Career) => void;
  selectedCareerIdForComparison?: string;
}

export const CareerComparisonTable: React.FC<CareerComparisonTableProps> = ({
  baselineMatches,
  setActiveTab,
  onOpenCareerModal,
  selectedCareerIdForComparison
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    selectedCareerIdForComparison || baselineMatches[0]?.career.id || 'fullstack-engineer',
    baselineMatches[1]?.career.id || 'ai-ml-engineer',
    baselineMatches[2]?.career.id || 'ui-ux-designer'
  ]);

  const selectedCareers: Career[] = selectedIds
    .map(id => CAREERS_DATA.find(c => c.id === id))
    .filter(Boolean) as Career[];

  const handleSelectCareer = (index: number, careerId: string) => {
    const updated = [...selectedIds];
    updated[index] = careerId;
    setSelectedIds(updated);
  };

  const handleRemoveSlot = (index: number) => {
    if (selectedIds.length > 2) {
      const updated = selectedIds.filter((_, i) => i !== index);
      setSelectedIds(updated);
    }
  };

  const handleAddSlot = () => {
    if (selectedIds.length < 3) {
      const unusedCareer = CAREERS_DATA.find(c => !selectedIds.includes(c.id)) || CAREERS_DATA[3];
      setSelectedIds([...selectedIds, unusedCareer.id]);
    }
  };

  const getScoreForCareer = (careerId: string) => {
    const found = baselineMatches.find(m => m.career.id === careerId);
    return found ? found.score : 80;
  };

  // Dynamic calculations for highest metrics among the chosen careers
  const topSalaryCareerId = useMemo(() => {
    let maxVal = -1;
    let maxId = '';
    selectedCareers.forEach(c => {
      const val = parseInt(c.comparison.avgSalary.replace(/[^0-9]/g, '')) || 0;
      if (val > maxVal) {
        maxVal = val;
        maxId = c.id;
      }
    });
    return maxId;
  }, [selectedCareers]);

  const topMatchCareerId = useMemo(() => {
    let maxScore = -1;
    let maxId = '';
    selectedCareers.forEach(c => {
      const s = getScoreForCareer(c.id);
      if (s > maxScore) {
        maxScore = s;
        maxId = c.id;
      }
    });
    return maxId;
  }, [selectedCareers]);

  const renderRatingBar = (level: string, color: string) => {
    const pct = level === 'High' ? 95 : level === 'Moderate' ? 65 : 35;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)' }} />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '65px' }}>
          {level}
        </span>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '28px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.06) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={13} />
                Multi-Dimensional Matrix
              </span>
              <span className="badge badge-cyan">
                Side-by-Side Comparison
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', marginBottom: '8px' }}>Career Comparison Table</h1>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
              Compare 2 to 3 target career disciplines side-by-side across coding intensity, analytical rigor, creative demands, learning duration, and typical market roles.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedIds.length < 3 && (
              <button
                onClick={handleAddSlot}
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                <Plus size={15} />
                <span>Add 3rd Career to Compare</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
        gap: '14px',
        marginBottom: '20px'
      }}>
        {selectedCareers.map((c, index) => (
          <div key={index} className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Column #{index + 1}
              </span>
              {selectedCareers.length > 2 && (
                <button
                  onClick={() => handleRemoveSlot(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-rose)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <X size={12} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <select
              value={c.id}
              onChange={(e) => handleSelectCareer(index, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {CAREERS_DATA.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} ({opt.category})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel comparison-matrix-wrapper" style={{ overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '16px 20px', width: '220px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Criteria
                </th>
                {selectedCareers.map(c => {
                  const isTopMatch = c.id === topMatchCareerId;
                  return (
                    <th key={c.id} style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-slate" style={{ fontSize: '0.66rem' }}>{c.category}</span>
                        {isTopMatch && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>
                            Best Fit
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-highlight)', marginTop: '4px' }}>
                        {c.title}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              
              {/* Row 1: Your Match Score */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-highlight)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Your Match %</span>
                  </div>
                </td>
                {selectedCareers.map(c => {
                  const score = getScoreForCareer(c.id);
                  return (
                    <td key={c.id} style={{ padding: '16px 20px' }}>
                      <div className={`match-score-pill ${score >= 85 ? 'match-high' : 'match-med'}`}>
                        {score}% Compatibility
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Coding Level */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={15} style={{ color: 'var(--accent-indigo)' }} />
                    <span>Coding Demand</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    {renderRatingBar(c.comparison.codingLevel, 'var(--accent-indigo)')}
                  </td>
                ))}
              </tr>

              {/* Row 3: Analytical Skills */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Analytical Rigor</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    {renderRatingBar(c.comparison.analyticalSkills, 'var(--accent-cyan)')}
                  </td>
                ))}
              </tr>

              {/* Row 4: Creativity */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={15} style={{ color: 'var(--accent-rose)' }} />
                    <span>Creativity</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    {renderRatingBar(c.comparison.creativity, 'var(--accent-rose)')}
                  </td>
                ))}
              </tr>

              {/* Row 5: Communication */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={15} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Communication</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    {renderRatingBar(c.comparison.communication, 'var(--accent-emerald)')}
                  </td>
                ))}
              </tr>

              {/* Row 6: Duration to Master */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} style={{ color: 'var(--accent-amber)' }} />
                    <span>Duration</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    <strong style={{ color: 'var(--text-highlight)', fontSize: '0.96rem' }}>{c.comparison.duration}</strong>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>4-Phase Curriculum</span>
                  </td>
                ))}
              </tr>

              {/* Row 7: Average Compensation */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={15} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Compensation</span>
                  </div>
                </td>
                {selectedCareers.map(c => {
                  const isTopSalary = c.id === topSalaryCareerId;
                  return (
                    <td key={c.id} style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          {c.comparison.avgSalary}
                        </span>
                        {isTopSalary && (
                          <span className="badge badge-amber" style={{ fontSize: '0.64rem' }}>
                            Top Earning
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>
                        {c.comparison.growthOutlook}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Typical Roles */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} style={{ color: 'var(--accent-indigo)' }} />
                    <span>Typical Roles</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c.comparison.typicalRoles.map((role, idx) => (
                        <span key={idx} className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 9: Top Tools */}
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Top Tools & Tech</span>
                  </div>
                </td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c.comparison.topTools.map((tool, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.74rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 10: Action Link */}
              <tr>
                <td style={{ padding: '16px 20px' }}></td>
                {selectedCareers.map(c => (
                  <td key={c.id} style={{ padding: '16px 20px' }}>
                    <button
                      onClick={() => onOpenCareerModal(c)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '8px 14px', width: '100%' }}
                    >
                      <span>View Roadmap</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
