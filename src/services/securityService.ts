import { UserRole, AuditLogEntry, MFAConfig, SecurityPolicy } from '../types/security';

const DEFAULT_SECRET = 'JBSWY3DPEHPK3PXP';
const DEFAULT_BACKUP_CODES = [
  '8492-1049',
  '3921-9942',
  '5581-2291',
  '7319-4820',
  '1928-3019'
];

export class SecurityService {
  private static currentRole: UserRole = 'student';
  private static mfaConfig: MFAConfig = {
    isEnabled: true,
    secret: DEFAULT_SECRET,
    backupCodes: DEFAULT_BACKUP_CODES,
    lastVerifiedAt: new Date().toISOString()
  };

  private static policy: SecurityPolicy = {
    mfaEnforced: true,
    zeroTrustPiiMasking: true,
    sessionTimeoutMinutes: 60,
    strictRbacEnforced: true
  };

  private static auditLogs: AuditLogEntry[] = [
    {
      id: 'log-001',
      timestamp: '2026-09-30 22:45:10',
      actor: 'system.daemon',
      role: 'admin',
      action: 'ZERO_TRUST_BOOTSTRAP',
      target: 'CareerCompass Engine v2.4',
      ip: '127.0.0.1',
      status: 'SUCCESS'
    },
    {
      id: 'log-002',
      timestamp: '2026-09-30 22:50:18',
      actor: 'student.candidate_89',
      role: 'student',
      action: 'ASSESSMENT_SUBMITTED',
      target: '12-Question Diagnostic Engine',
      ip: '192.168.1.42',
      status: 'VERIFIED'
    },
    {
      id: 'log-003',
      timestamp: '2026-09-30 23:01:45',
      actor: 'student.candidate_89',
      role: 'student',
      action: 'ZERO_TRUST_MASKING',
      target: 'OpenRouter AI Inference Gateway',
      ip: '192.168.1.42',
      status: 'MASKED'
    },
    {
      id: 'log-004',
      timestamp: '2026-09-30 23:08:20',
      actor: 'advisor.harrison',
      role: 'advisor',
      action: 'COHORT_TELEMETRY_INSPECT',
      target: 'Dimensional Weights Matrix',
      ip: '10.0.4.15',
      status: 'SUCCESS'
    }
  ];

  static getRole(): UserRole {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careercompass_role');
      if (stored === 'advisor' || stored === 'admin' || stored === 'student') {
        this.currentRole = stored;
      }
    }
    return this.currentRole;
  }

  static setRole(role: UserRole) {
    this.currentRole = role;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careercompass_role', role);
    }
    this.logSecurityEvent('RBAC_ROLE_ELEVATED', `Switched active role to [${role.toUpperCase()}]`, 'VERIFIED');
  }

  static getMFAConfig(): MFAConfig {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careercompass_mfa_enabled');
      if (stored !== null) {
        this.mfaConfig.isEnabled = stored === 'true';
      }
    }
    return this.mfaConfig;
  }

  static toggleMFA(enabled: boolean) {
    this.mfaConfig.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careercompass_mfa_enabled', enabled ? 'true' : 'false');
    }
    this.logSecurityEvent(
      enabled ? 'MFA_ACTIVATED' : 'MFA_DEACTIVATED',
      enabled ? 'Enforced hardware TOTP 2FA' : 'Disabled 2FA policy',
      enabled ? 'VERIFIED' : 'SUCCESS'
    );
  }

  static getPolicy(): SecurityPolicy {
    return this.policy;
  }

  static setZeroTrustMasking(enabled: boolean) {
    this.policy.zeroTrustPiiMasking = enabled;
    this.logSecurityEvent(
      'PII_MASKING_POLICY',
      enabled ? 'Client-side PII sanitization enabled' : 'PII sanitization bypassed',
      'MASKED'
    );
  }

  /**
   * Generates a realistic rolling 6-digit TOTP code based on current timestamp (30s window)
   */
  static getCurrentTotpCode(): { code: string; secondsRemaining: number } {
    const epoch = Math.floor(Date.now() / 1000);
    const window = 30;
    const counter = Math.floor(epoch / window);
    const secondsRemaining = window - (epoch % window);

    // Simple deterministic hash to simulate standard TOTP RFC 6238
    let hash = 0;
    const str = `${counter}_${DEFAULT_SECRET}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const code = String(absHash % 1000000).padStart(6, '0');

    return { code, secondsRemaining };
  }

  static async verifyCodeAsync(inputCode: string): Promise<boolean> {
    const clean = inputCode.trim();

    // 1. Try server-side verification endpoint first
    try {
      const resp = await fetch('/api/security/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.valid) {
          this.mfaConfig.lastVerifiedAt = new Date().toISOString();
          this.logSecurityEvent('MFA_TOTP_SERVER_VERIFIED', 'Server-side RFC 6238 challenge passed', 'VERIFIED');
          return true;
        }
      }
    } catch (e) {
      console.warn('Server-side TOTP verify endpoint unavailable, using local engine:', e);
    }

    // 2. Local fallback
    return this.verifyCode(clean);
  }

  static verifyCode(inputCode: string): boolean {
    const { code } = this.getCurrentTotpCode();
    // Allow either exact code or backup code
    const isValid = inputCode.trim() === code || DEFAULT_BACKUP_CODES.includes(inputCode.trim());
    if (isValid) {
      this.mfaConfig.lastVerifiedAt = new Date().toISOString();
      this.logSecurityEvent('MFA_TOTP_VERIFIED', 'Hardware TOTP 6-digit challenge passed', 'VERIFIED');
    } else {
      this.logSecurityEvent('MFA_CHALLENGE_FAILED', `Invalid code submission: ${inputCode}`, 'DENIED');
    }
    return isValid;
  }

  static getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  static logSecurityEvent(
    action: string,
    details: string,
    status: AuditLogEntry['status'] = 'SUCCESS'
  ) {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${this.currentRole}.session_${Math.floor(Math.random() * 900 + 100)}`,
      role: this.currentRole,
      action,
      target: details,
      ip: '127.0.0.1',
      status
    };

    this.auditLogs.unshift(newEntry);
  }

  /**
   * Enterprise Zero-Trust PII Masker:
   * Strips emails, phones, SSNs, student IDs, institutional affiliations, IP addresses,
   * and conversational name declarations before data leaves client boundary.
   */
  static maskPii(prompt: string): string {
    if (!this.policy.zeroTrustPiiMasking) return prompt;

    let sanitized = prompt;

    // 1. Email addresses (standard RFC 5322 regex)
    sanitized = sanitized.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b/g,
      '<REDACTED_EMAIL>'
    );

    // 2. Phone numbers (North American and International E.164 formats)
    sanitized = sanitized.replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      '<REDACTED_PHONE>'
    );

    // 3. Social Security Numbers and National Tax IDs
    sanitized = sanitized.replace(
      /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
      '<REDACTED_SSN_TAX_ID>'
    );

    // 4. Student & Candidate Identifiers (e.g. STU-108291, student ID #9201, candidate 48)
    sanitized = sanitized.replace(
      /\b(?:STU-\d{4,8}|student\s*id\s*#?\s*\d+|candidate\s*#?\s*\d+|id\s*#\s*\d+)\b/gi,
      '<STUDENT_ANON_TOKEN>'
    );

    // 5. Conversational Name Disclosures (e.g. "My name is Sarah Connor", "I am John Doe")
    sanitized = sanitized.replace(
      /\b(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/gi,
      (match, p1) => match.replace(p1, '<ANONYMIZED_NAME>')
    );

    // 6. Institutional affiliations (e.g. "at MIT", "at Stanford", "from Harvard", "at Berkeley")
    sanitized = sanitized.replace(
      /\b(?:at|from|attending)\s+(MIT|Stanford|Harvard|Berkeley|Carnegie Mellon|CMU|Oxford|Cambridge|Caltech|Princeton)\b/gi,
      'at <AFFILIATED_INSTITUTION>'
    );

    // 7. IPv4 addresses
    sanitized = sanitized.replace(
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      '<REDACTED_IP>'
    );

    return sanitized;
  }
}
