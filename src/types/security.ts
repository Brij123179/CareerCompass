export type UserRole = 'student' | 'advisor' | 'admin';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  ip: string;
  status: 'SUCCESS' | 'VERIFIED' | 'MASKED' | 'ELEVATED' | 'DENIED';
}

export interface MFAConfig {
  isEnabled: boolean;
  secret: string;
  backupCodes: string[];
  lastVerifiedAt?: string;
}

export interface SecurityPolicy {
  mfaEnforced: boolean;
  zeroTrustPiiMasking: boolean;
  sessionTimeoutMinutes: number;
  strictRbacEnforced: boolean;
}
