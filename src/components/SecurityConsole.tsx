import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Key, Lock, Users, Eye, RefreshCw, CheckCircle2, AlertTriangle, FileText, Smartphone, Laptop, Check, Copy, GraduationCap, Download, Upload, ArrowUpRight, LogIn, Database } from 'lucide-react';
import { UserRole, AuditLogEntry, MFAConfig } from '../types/security';
import { DimensionScores, StudentProfile } from '../types';
import { SecurityService } from '../services/securityService';
import { CohortService } from '../services/cohortService';
import { AuthService, AuthUser } from '../services/authService';

interface SecurityConsoleProps {
  currentRole: UserRole;
  currentUser: AuthUser | null;
  onRoleChange: (role: UserRole) => void;
  mfaActive: boolean;
  onMfaToggle: (enabled: boolean) => void;
  onLoadStudentProfile?: (scores: DimensionScores, studentName: string) => void;
  onOpenAuthModal: () => void;
}

export const SecurityConsole: React.FC<SecurityConsoleProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  mfaActive,
  onMfaToggle,
  onLoadStudentProfile,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'mfa' | 'audit' | 'zerotrust' | 'cohorts'>('rbac');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SecurityService.getAuditLogs());
  const [cohortStudents, setCohortStudents] = useState<StudentProfile[]>(CohortService.getStudents());
  const [totpData, setTotpData] = useState<{ code: string; secondsRemaining: number }>({ code: '000000', secondsRemaining: 30 });
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyFeedback, setVerifyFeedback] = useState<'idle' | 'success' | 'fail'>('idle');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [piiInput, setPiiInput] = useState('My name is Sarah Connor (student ID #9201 at MIT), contact me at sconnor@mit.edu or +1 (617) 253-1000 about my SSN: 000-12-3456.');
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(SecurityService.getPolicy().zeroTrustPiiMasking);
  const [loadedStudentName, setLoadedStudentName] = useState<string | null>(null);
  const [dbUsers, setDbUsers] = useState<any[]>([]);

  // Fetch real users from SQLite when admin is active
  useEffect(() => {
    if (currentRole === 'admin') {
      const token = AuthService.getToken();
      fetch('/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.users) {
            setDbUsers(data.users);
          }
        })
        .catch(() => {});
    }
  }, [currentRole]);

  // Live TOTP countdown timer
  useEffect(() => {
    const update = () => {
      setTotpData(SecurityService.getCurrentTotpCode());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyTotp = async () => {
    const valid = await SecurityService.verifyCodeAsync(verifyInput);
    if (valid) {
      setVerifyFeedback('success');
      setAuditLogs(SecurityService.getAuditLogs());
      setTimeout(() => setVerifyFeedback('idle'), 2500);
    } else {
      setVerifyFeedback('fail');
      setTimeout(() => setVerifyFeedback('idle'), 2500);
    }
    setVerifyInput('');
  };

  const handleTogglePii = () => {
    const next = !piiMaskingEnabled;
    setPiiMaskingEnabled(next);
    SecurityService.setZeroTrustMasking(next);
    setAuditLogs(SecurityService.getAuditLogs());
  };

  const maskedPreview = SecurityService.maskPii(piiInput);

  return (
    <div style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '26px',
        border: '1px solid var(--border-medium)',
        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.08) 0%, rgba(5, 150, 105, 0.06) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} />
                Enterprise Security & Compliance
              </span>
              <span className="badge badge-emerald">
                {mfaActive ? 'MFA Hardware TOTP Active' : 'MFA Optional'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', marginBottom: '8px' }}>Security & Governance Console</h1>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
              Institutional-grade Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA), Zero-Trust PII masking, and immutable security audit trails.
            </p>
          </div>

          {/* Institutional Access & Identity Badge */}
          <div className="glass-panel" style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--bg-card)',
            border: currentRole === 'admin' ? '1px solid rgba(244, 63, 94, 0.4)' : currentRole === 'advisor' ? '1px solid rgba(5, 150, 105, 0.4)' : '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: currentRole === 'admin' ? 'rgba(244, 63, 94, 0.12)' : currentRole === 'advisor' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(14, 165, 233, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentRole === 'admin' ? <ShieldAlert size={19} style={{ color: 'var(--accent-rose)' }} /> : currentRole === 'advisor' ? <GraduationCap size={19} style={{ color: 'var(--accent-emerald)' }} /> : <ShieldCheck size={19} style={{ color: 'var(--accent-cyan)' }} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-highlight)' }}>
                  {currentUser?.name || (currentRole === 'admin' ? 'CISO Admin' : currentRole === 'advisor' ? 'Dr. Evelyn Vance' : 'Alex Mercer')}
                </span>
                <span className={`badge ${currentRole === 'admin' ? 'badge-rose' : currentRole === 'advisor' ? 'badge-emerald' : 'badge-slate'}`} style={{ textTransform: 'uppercase', fontSize: '0.62rem' }}>
                  {currentRole}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentUser?.email || (currentRole === 'admin' ? 'admin@careercompass.io' : currentRole === 'advisor' ? 'advisor@careercompass.io' : 'student@mit.edu')}
              </span>
            </div>

            {currentRole === 'student' ? (
              <button
                onClick={onOpenAuthModal}
                className="btn-primary"
                style={{ fontSize: '0.76rem', padding: '6px 12px', gap: '5px' }}
                title="Admin or Advisor privileges require authenticated sign-in with 2-Factor Authentication"
              >
                <Lock size={12} />
                <span>Elevate to Admin (MFA)</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '5px 10px', gap: '4px' }}
                title="Switch authenticated persona or credentials"
              >
                <LogIn size={12} />
                <span>Switch Role</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security Console Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('rbac')}
          className="btn-secondary"
          style={{
            background: activeTab === 'rbac' ? 'var(--gradient-brand)' : 'var(--bg-card)',
            color: activeTab === 'rbac' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'rbac' ? 'transparent' : 'var(--border-subtle)'
          }}
        >
          <Users size={15} />
          <span>RBAC Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('mfa')}
          className="btn-secondary"
          style={{
            background: activeTab === 'mfa' ? 'var(--gradient-brand)' : 'var(--bg-card)',
            color: activeTab === 'mfa' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'mfa' ? 'transparent' : 'var(--border-subtle)'
          }}
        >
          <Smartphone size={15} />
          <span>Multi-Factor Authentication (MFA)</span>
        </button>

        <button
          onClick={() => setActiveTab('zerotrust')}
          className="btn-secondary"
          style={{
            background: activeTab === 'zerotrust' ? 'var(--gradient-brand)' : 'var(--bg-card)',
            color: activeTab === 'zerotrust' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'zerotrust' ? 'transparent' : 'var(--border-subtle)'
          }}
        >
          <Eye size={15} />
          <span>Zero-Trust PII Masker</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className="btn-secondary"
          style={{
            background: activeTab === 'audit' ? 'var(--gradient-brand)' : 'var(--bg-card)',
            color: activeTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'audit' ? 'transparent' : 'var(--border-subtle)'
          }}
        >
          <FileText size={15} />
          <span>Audit Log Telemetry ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cohorts')}
          className="btn-secondary"
          style={{
            background: activeTab === 'cohorts' ? 'var(--gradient-brand)' : 'var(--bg-card)',
            color: activeTab === 'cohorts' ? '#ffffff' : 'var(--text-secondary)',
            borderColor: activeTab === 'cohorts' ? 'transparent' : 'var(--border-subtle)'
          }}
        >
          <GraduationCap size={15} />
          <span>Student Cohorts & Analytics ({cohortStudents.length})</span>
        </button>
      </div>

      {/* TAB 1: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Role-Based Access Control (RBAC) Governance</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Granular privileges mapped across Student, Counselor/Advisor, and Institutional Security Lead personas.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Feature Privilege</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student / Candidate</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Advisor</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institution Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>12-Question Diagnostic Assessment</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>What-If Sensitivity Simulator</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>AI Mentor & Career Studio</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-cyan">Sanitized Prompts</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-indigo">Advisor Prompts</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full System Config</span></td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>Mathematical Formula Audit & Weights</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-slate">Read Only</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Audit & Annotate</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Calibration</span></td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>Institutional Security Audit Logs</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-rose">Restricted</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-slate">Cohort Only</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Full Access</span></td>
                </tr>

                <tr>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>MFA Enforcement & Key Rotation</td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-slate">Self-Enrolled</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-slate">Self-Enrolled</span></td>
                  <td style={{ padding: '14px 18px' }}><span className="badge badge-emerald">Global Enforce</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-FACTOR AUTHENTICATION (MFA / 2FA) */}
      {activeTab === 'mfa' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* TOTP Live Generator Card */}
          <div className="glass-panel" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} style={{ color: 'var(--accent-indigo)' }} />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Hardware TOTP Authenticator</h3>
              </div>
              <span className={`badge ${mfaActive ? 'badge-emerald' : 'badge-slate'}`}>
                {mfaActive ? 'Enforced' : 'Disabled'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Compatible with Google Authenticator, Authy, and 1Password. Generates a new 6-digit cryptographic token every 30 seconds.
            </p>

            {/* Simulated Live Rolling Code */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rolling Authentication Code
              </span>
              
              <div style={{
                fontSize: '2.8rem',
                fontFamily: 'monospace',
                fontWeight: 800,
                color: 'var(--accent-indigo)',
                letterSpacing: '0.15em',
                margin: '8px 0'
              }}>
                {totpData.code.slice(0, 3)} {totpData.code.slice(3)}
              </div>

              {/* Countdown Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={13} className="animate-spin" />
                <span>Refreshes in {totpData.secondsRemaining}s</span>
              </div>
            </div>

            {/* Toggle MFA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-highlight)', display: 'block' }}>Enforce 2FA for this Session</strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Requires 6-digit challenge verification on sensitive actions</span>
              </div>
              <button
                onClick={() => onMfaToggle(!mfaActive)}
                className={mfaActive ? 'btn-secondary' : 'btn-primary'}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {mfaActive ? 'Disable MFA' : 'Enable MFA'}
              </button>
            </div>
          </div>

          {/* Test Verification Input Card */}
          <div className="glass-panel" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Test TOTP Challenge Verification</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Enter the active 6-digit rolling code or any backup recovery code to test authentication.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                maxLength={9}
                placeholder="e.g. 849201 or 8492-1049"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: verifyFeedback === 'fail' ? '1px solid var(--accent-rose)' : '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleVerifyTotp}
              disabled={!verifyInput.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Verify Security Challenge
            </button>

            {verifyFeedback === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', marginTop: '12px', fontSize: '0.84rem' }}>
                <CheckCircle2 size={16} />
                <span>Security challenge verified! Audit log entry generated.</span>
              </div>
            )}

            {verifyFeedback === 'fail' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', marginTop: '12px', fontSize: '0.84rem' }}>
                <AlertTriangle size={16} />
                <span>Verification failed. Invalid TOTP token.</span>
              </div>
            )}

            {/* Backup Codes Drawer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                Emergency Backup Recovery Codes:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SecurityService.getMFAConfig().backupCodes.map((code, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ZERO-TRUST PII MASKING */}
      {activeTab === 'zerotrust' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Client-Side Zero-Trust PII Masking</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Automatically strips student identifiers, emails, and phone numbers before queries reach external AI LLMs.
              </p>
            </div>
            
            <button
              onClick={handleTogglePii}
              className={piiMaskingEnabled ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {piiMaskingEnabled ? 'PII Sanitizer: ACTIVE' : 'PII Sanitizer: BYPASS'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Raw User Input (Client Side)
              </label>
              <textarea
                rows={4}
                value={piiInput}
                onChange={(e) => setPiiInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Sanitized Payload Dispatched to OpenRouter
              </label>
              <div style={{
                minHeight: '105px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-emerald)',
                color: 'var(--text-highlight)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                boxShadow: 'var(--shadow-sm)'
              }}>
                {maskedPreview}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG TELEMETRY & SQL DATABASE */}
      {activeTab === 'audit' && (
        currentRole !== 'admin' ? (
          <div className="glass-panel" style={{ padding: '48px 30px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldAlert size={28} style={{ color: 'var(--accent-rose)' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Institutional Administrator Privilege Required</h3>
            <p style={{ maxWidth: '540px', margin: '0 auto 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              You are currently authenticated as <strong>{currentRole.toUpperCase()}</strong>. System-wide user directory access (`careercompass.db`), cryptographic audit log telemetry, and MFA enforcement policies are strictly restricted to verified Institution Administrators.
            </p>
            <button onClick={onOpenAuthModal} className="btn-primary" style={{ padding: '10px 22px' }}>
              <Key size={15} />
              <span>Authenticate as Institutional Admin (with MFA)</span>
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '28px' }}>
            {/* SQLite Users Table */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={18} style={{ color: 'var(--accent-indigo)' }} />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>SQLite User Directory (`careercompass.db`)</h3>
                </div>
                <span className="badge badge-emerald">node:sqlite Persistent</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Persistent enterprise user accounts with salted SHA-256 password hashing and TOTP RFC 6238 two-factor secrets.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User ID & Name</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>2FA / MFA</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbUsers.length > 0 ? dbUsers : [
                      { id: 'usr-admin-01', name: 'Chief Information Security Officer (Admin)', email: 'admin@careercompass.io', role: 'admin', mfa_enabled: 1, created_at: '2026-09-30' },
                      { id: 'usr-advisor-01', name: 'Dr. Evelyn Vance (Senior Advisor)', email: 'advisor@careercompass.io', role: 'advisor', mfa_enabled: 0, created_at: '2026-09-30' },
                      { id: 'usr-student-01', name: 'Alex Mercer (Candidate)', email: 'student@mit.edu', role: 'student', mfa_enabled: 0, created_at: '2026-09-30' }
                    ]).map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontSize: '0.84rem' }}>
                          <strong style={{ color: 'var(--text-highlight)' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>{u.id}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${u.role === 'admin' ? 'badge-rose' : u.role === 'advisor' ? 'badge-emerald' : 'badge-slate'}`} style={{ textTransform: 'uppercase', fontSize: '0.66rem' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${u.mfa_enabled ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.66rem' }}>
                            {u.mfa_enabled ? 'Enforced' : 'Optional'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Immutable Telemetry */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Immutable Security Audit Telemetry</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Real-time cryptographic audit log of authentication, role escalation, and AI model inference events.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actor & Role</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target / Scope</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.84rem' }}>
                        <strong style={{ color: 'var(--text-highlight)' }}>{log.actor}</strong>
                        <span className="badge badge-slate" style={{ fontSize: '0.66rem', marginLeft: '6px' }}>{log.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-indigo)' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {log.target}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${
                          log.status === 'VERIFIED' ? 'badge-emerald' :
                          log.status === 'MASKED' ? 'badge-cyan' :
                          log.status === 'DENIED' ? 'badge-rose' : 'badge-slate'
                        }`} style={{ fontSize: '0.68rem' }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* TAB 5: STUDENT COHORTS & ANALYTICS */}
      {activeTab === 'cohorts' && (
        currentRole === 'student' ? (
          <div className="glass-panel" style={{ padding: '48px 30px', textAlign: 'center', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(79, 70, 229, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <GraduationCap size={28} style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Academic Advisor / Counselor Access Required</h3>
            <p style={{ maxWidth: '540px', margin: '0 auto 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Institutional student cohort diagnostics, curriculum bottlenecks, and aggregate analytics are restricted to certified Academic Advisors and Faculty.
            </p>
            <button onClick={onOpenAuthModal} className="btn-primary" style={{ padding: '10px 22px' }}>
              <LogIn size={15} />
              <span>Authenticate as Academic Advisor</span>
            </button>
          </div>
        ) : (() => {
          const analytics = CohortService.getAnalytics();
          return (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Institutional Cohort Analytics & Multi-User Governance</h3>
                  <span className="badge badge-emerald">Encrypted Persistence</span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Aggregate analytics across enrolled student candidates, diagnostic bottleneck identification, and database sync.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const data = CohortService.exportDatabase();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `careercompass-cohort-database.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '7px 12px' }}
                >
                  <Download size={14} />
                  <span>Export Cohort Database (.json)</span>
                </button>
              </div>
            </div>

            {loadedStudentName && (
              <div style={{
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-emerald)',
                fontSize: '0.86rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={16} />
                <span>Loaded profile for <strong>{loadedStudentName}</strong> into active session! Navigate to Results, Simulator, or AI Mentor to test with this student's data.</span>
              </div>
            )}

            {/* Analytics Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '26px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Enrolled Cohort</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-highlight)' }}>
                  {analytics.totalStudents} Candidates
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)' }}>Class of 2026/2027</span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Aptitude Cluster</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-indigo)', marginTop: '4px' }}>
                  {analytics.cohortTopAptitude}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cross-evaluated</span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identified Skill Bottleneck</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-amber)', marginTop: '4px' }}>
                  {analytics.identifiedBottlenecks[0]?.dimension || 'Creative & UX'} ({analytics.identifiedBottlenecks[0]?.avgPct || 54}%)
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Institutional curriculum priority</span>
              </div>
            </div>

            {/* Student Roster Table */}
            <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Enrolled Student Candidates</h4>
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student ID & Candidate</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institution / Email</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Path</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Timestamp</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.84rem' }}>
                        <strong style={{ color: 'var(--text-highlight)', display: 'block' }}>{student.name}</strong>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{student.id} • {student.cohortYear}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.84rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                        {student.targetCareerId ? student.targetCareerId.replace(/-/g, ' ').toUpperCase() : 'General Tech'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(student.verifiedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => {
                            if (onLoadStudentProfile) {
                              onLoadStudentProfile(student.scores, student.name);
                              setLoadedStudentName(student.name);
                            }
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '0.76rem', padding: '5px 10px', gap: '4px' }}
                          title="Simulate app using this student's assessment scores"
                        >
                          <ArrowUpRight size={13} />
                          <span>Load Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Curriculum Recommendations for Advisor */}
            <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h5 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--accent-indigo)' }}>
                🎯 Institutional Curriculum Intervention Recommended:
              </h5>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {analytics.identifiedBottlenecks[0]?.recommendation} 80% of candidates show ready foundations for systems programming, while only 42% demonstrate adequate design systems or stakeholder communication experience.
              </p>
            </div>

          </div>
        );
      })())}

    </div>
  );
};
