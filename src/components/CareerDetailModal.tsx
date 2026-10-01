import React from 'react';
import { X, BookOpen, Award, ArrowRight, Scale, MessageSquareCode } from 'lucide-react';
import { Career, DimensionScores } from '../types';
import { ActiveTab } from './Navbar';

interface CareerDetailModalProps {
  career: Career | null;
  userScores: DimensionScores;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectForComparison: (careerId: string) => void;
}

export const CareerDetailModal: React.FC<CareerDetailModalProps> = ({
  career,
  onClose,
  setActiveTab,
  onSelectForComparison
}) => {
  if (!career) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '920px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative',
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-card)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{career.category}</span>
            <span className="badge badge-cyan">{career.comparison.duration} Curriculum</span>
            <span className="badge badge-emerald">{career.comparison.avgSalary} Avg Salary</span>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '6px', color: 'var(--text-highlight)' }}>
            {career.title}
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {career.description}
          </p>
        </div>

        {/* 4-Phase Visual Learning Roadmap */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Visual Learning Roadmap (4 Phases)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {career.roadmap.map(step => (
              <div
                key={step.step}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 22px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Phase {step.step} • {step.phase} ({step.duration})
                  </span>
                  <h4 style={{ fontSize: '1.08rem', color: 'var(--text-highlight)', margin: '4px 0 8px' }}>
                    {step.title}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {step.keySkills.map((k, i) => (
                      <span key={i} className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    background: 'var(--bg-card)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}>
                    <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: '2px' }}>
                      Recommended Capstone Project:
                    </strong>
                    <span style={{ color: 'var(--text-primary)' }}>{step.recommendedProject}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--accent-indigo)' }}>Certification Target: </strong>
                    <span>{step.certificationOrResource}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Courses & Certifications */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} style={{ color: 'var(--accent-amber)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Curated Courses & Learning Pathways</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {career.courses.map((course, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}
              >
                {course.badge && (
                  <span className="badge badge-amber" style={{ fontSize: '0.66rem', marginBottom: '6px' }}>
                    {course.badge}
                  </span>
                )}
                <h4 style={{ fontSize: '0.94rem', color: 'var(--text-highlight)', marginBottom: '4px' }}>
                  {course.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span>{course.provider}</span>
                  <span>{course.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              onSelectForComparison(career.id);
              setActiveTab('comparison');
              onClose();
            }}
            className="btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <Scale size={14} />
            <span>Compare in Matrix</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mentor');
              onClose();
            }}
            className="btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <MessageSquareCode size={14} />
            <span>Consult AI Mentor</span>
          </button>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <span>Close Roadmap</span>
          </button>
        </div>

      </div>
    </div>
  );
};
