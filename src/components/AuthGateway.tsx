import React from 'react';
import { ShieldCheck, ShieldAlert, Users, GraduationCap, Lock, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

interface AuthGatewayProps {
  onSelectDemo: (role: 'student' | 'advisor' | 'admin') => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  onSelectDemo
}) => {
  return (
    <div style={{ paddingBottom: '80px', paddingTop: '24px' }}>
      
      {/* Institutional Gateway Hero with Ambient Command Center Aesthetic */}
      <div className="glass-panel" style={{
        padding: '48px 36px 40px',
        marginBottom: '36px',
        textAlign: 'center',
        border: '1px solid var(--border-glow)',
        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.05) 50%, rgba(5, 150, 105, 0.06) 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Subtle decorative background glow orb */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '140px',
          background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.22) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(79, 70, 229, 0.1)',
          border: '1px solid rgba(79, 70, 229, 0.3)',
          marginBottom: '20px'
        }}>
          <span className="status-indicator-dot" style={{ backgroundColor: '#059669', color: '#059669' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-indigo)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Enterprise Access Control • 2-Factor Hardware MFA Enforced
          </span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          CareerCompass <span className="text-gradient">Institutional Portal</span>
        </h1>

        <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          Deterministic smart education & career recommender powered by mathematical scoring algorithms, real SQLite database persistence, and mandatory RFC 6238 hardware TOTP multi-factor security.
        </p>

        {/* 3-Step Visual Security Timeline */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'var(--bg-card)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--accent-indigo)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>1</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Sign In / SQL Register
            </span>
          </div>

          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>2</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
              6-Digit TOTP MFA Challenge
            </span>
          </div>

          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-highlight)' }}>
              Full Platform Access Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* 3 Quick 1-Click Evaluator Personas */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Evaluator Access
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Evaluator 1-Click Personas (Pre-Seeded in SQLite)
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Click any persona below to trigger the verified credentials flow and experience live RFC 6238 TOTP two-factor authentication.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Persona 1: Student */}
          <div className="card-premium card-accent-cyan" style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(2, 132, 199, 0.04) 100%)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Student Candidate</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-indicator-dot" style={{ backgroundColor: '#059669', color: '#059669' }} />
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>MFA Protected</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(2, 132, 199, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
                  flexShrink: 0
                }}>
                  <GraduationCap size={24} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-highlight)' }}>Alex Mercer</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>student@mit.edu</span>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                Pre-configured student candidate with a 9-dimensional aptitude score (88% Full Stack Engineer match).
              </p>

              <div style={{
                background: 'var(--bg-secondary)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '22px',
                border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ color: 'var(--text-highlight)', display: 'block', marginBottom: '6px' }}>Unlocks Upon MFA Verification:</strong>
                • Personalized Student Dashboard & Roadmap<br />
                • PPP Geographic Salary Calibration<br />
                • 12-Question Diagnostic & What-If Simulator<br />
                • AI Career Mentor & Comparison Matrix
              </div>
            </div>

            <button
              onClick={() => onSelectDemo('student')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.88rem',
                gap: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              <span>Sign In as Student (with MFA)</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Persona 2: Advisor */}
          <div className="card-premium card-accent-emerald" style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(5, 150, 105, 0.04) 100%)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Academic Advisor</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-indicator-dot" style={{ backgroundColor: '#059669', color: '#059669' }} />
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>MFA Protected</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(5, 150, 105, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
                  flexShrink: 0
                }}>
                  <Users size={24} style={{ color: 'var(--accent-emerald)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-highlight)' }}>Dr. Evelyn Vance</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>advisor@careercompass.io</span>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                Certified Senior Academic Advisor with institutional oversight of Class of 2026 student cohort data.
              </p>

              <div style={{
                background: 'var(--bg-secondary)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '22px',
                border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ color: 'var(--text-highlight)', display: 'block', marginBottom: '6px' }}>Unlocks Upon MFA Verification:</strong>
                • Enrolled Student Cohort Analytics & Roster<br />
                • Curriculum Bottleneck Radar & Action Plans<br />
                • Candidate Diagnostic Profile Drill-Down<br />
                • Export Encrypted Cohort Database (.json)
              </div>
            </div>

            <button
              onClick={() => onSelectDemo('advisor')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.88rem',
                gap: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
              }}
            >
              <span>Sign In as Advisor (with MFA)</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Persona 3: Admin */}
          <div className="card-premium card-accent-rose" style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(225, 29, 72, 0.04) 100%)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-rose" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Institution Admin</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-indicator-dot" style={{ backgroundColor: '#e11d48', color: '#e11d48' }} />
                  <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>MFA Enforced</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(225, 29, 72, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.2)',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={24} style={{ color: 'var(--accent-rose)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-highlight)' }}>CISO Admin Lead</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>admin@careercompass.io</span>
                </div>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                Chief Information Security Officer managing institutional compliance, cryptographic secrets, and SQL directory.
              </p>

              <div style={{
                background: 'var(--bg-secondary)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '22px',
                border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ color: 'var(--text-highlight)', display: 'block', marginBottom: '6px' }}>Unlocks Upon MFA Verification:</strong>
                • SQLite Institutional User Directory (`careercompass.db`)<br />
                • Immutable Cryptographic Audit Log Telemetry<br />
                • Granular Role-Based Access Control Governance<br />
                • Global MFA Enforcement & Key Rotation
              </div>
            </div>

            <button
              onClick={() => onSelectDemo('admin')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.88rem',
                gap: '8px',
                background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
              }}
            >
              <span>Sign In as Admin (with MFA)</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
