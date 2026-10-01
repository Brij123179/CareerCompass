import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'careercompass.db');
let db: DatabaseSync;

try {
  db = new DatabaseSync(DB_PATH);
} catch (e) {
  console.warn('Fallback to in-memory SQLite database:', e);
  db = new DatabaseSync(':memory:');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_careercompass_2026').digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'advisor', 'admin')),
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      mfa_secret TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Assessments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      top_career_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      scores_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // 3. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      actor TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      ip TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Ensure all enterprise users have MFA enabled
  db.exec('UPDATE users SET mfa_enabled = 1;');

  // Seed default admin, advisor, and student if users table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countRow.count === 0) {
    console.log('[SQLite DB] Seeding default enterprise accounts...');

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, mfa_enabled, mfa_secret, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Admin account with MFA enabled
    insertUser.run(
      'usr-admin-01',
      'Chief Information Security Officer (Admin)',
      'admin@careercompass.io',
      hashPassword('Admin@2026!'),
      'admin',
      1,
      'JBSWY3DPEHPK3PXP',
      new Date().toISOString()
    );

    // 2. Academic Advisor account with MFA enabled
    insertUser.run(
      'usr-advisor-01',
      'Dr. Evelyn Vance (Senior Advisor)',
      'advisor@careercompass.io',
      hashPassword('Advisor@2026!'),
      'advisor',
      1,
      'JBSWY3DPEHPK3PXP',
      new Date().toISOString()
    );

    // 3. Student Candidate account with MFA enabled
    insertUser.run(
      'usr-student-01',
      'Alex Mercer (Candidate)',
      'student@mit.edu',
      hashPassword('Student@2026!'),
      'student',
      1,
      'JBSWY3DPEHPK3PXP',
      new Date().toISOString()
    );

    // 4. Sample cohort students
    const sampleCohort = [
      { id: 'usr-stu-02', name: 'Maya Lin', email: 'maya.lin@mit.edu', career: 'ai-ml-engineer', score: 94 },
      { id: 'usr-stu-03', name: 'Jordan Reed', email: 'jreed@berkeley.edu', career: 'fullstack-engineer', score: 91 },
      { id: 'usr-stu-04', name: 'Sophia Vance', email: 'svance@rhodeisland.edu', career: 'ui-ux-designer', score: 89 },
      { id: 'usr-stu-05', name: 'Marcus Chen', email: 'mchen@cmu.edu', career: 'cybersecurity-analyst', score: 93 }
    ];

    sampleCohort.forEach(s => {
      insertUser.run(
        s.id,
        s.name,
        s.email,
        hashPassword('Student@2026!'),
        'student',
        0,
        'JBSWY3DPEHPK3PXP',
        new Date().toISOString()
      );

      db.prepare(`
        INSERT INTO assessments (id, user_id, top_career_id, score, scores_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'asm-' + s.id,
        s.id,
        s.career,
        s.score,
        JSON.stringify({ technical: 22, problemSolving: 23, analytical: 24, communication: 18 }),
        new Date().toISOString()
      );
    });

    // Seed initial audit log
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, actor, role, action, target, ip, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'log-bootstrap-01',
      'usr-admin-01',
      'system.daemon',
      'admin',
      'DATABASE_INITIALIZED',
      'SQLite careercompass.db schemas generated & seeded',
      '127.0.0.1',
      'SUCCESS',
      new Date().toISOString()
    );

    console.log('[SQLite DB] Seed complete: Admin, Advisor, and Student accounts created.');
  }
}

// User Operations
export function getUserByEmail(email: string): any {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

export function getUserById(id: string): any {
  return db.prepare('SELECT id, name, email, role, mfa_enabled, mfa_secret, created_at FROM users WHERE id = ?').get(id);
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'advisor' | 'admin';
  mfaEnabled?: boolean;
}): { id: string; name: string; email: string; role: string; mfaEnabled: boolean } {
  const id = 'usr-' + crypto.randomUUID().slice(0, 8);
  const secret = 'JBSWY3DPEHPK3PXP';
  const mfa = 1; // All enterprise users are protected with MFA
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, mfa_enabled, mfa_secret, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name.trim(),
    data.email.toLowerCase().trim(),
    hashPassword(data.password),
    data.role,
    mfa,
    secret,
    now
  );

  return {
    id,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    role: data.role,
    mfaEnabled: Boolean(mfa)
  };
}

export function updateUserMfa(userId: string, enabled: boolean): void {
  db.prepare('UPDATE users SET mfa_enabled = ? WHERE id = ?').run(enabled ? 1 : 0, userId);
}

export function getAllUsers(): any[] {
  return db.prepare('SELECT id, name, email, role, mfa_enabled, created_at FROM users ORDER BY created_at DESC').all();
}

// Assessment Operations
export function saveUserAssessment(userId: string, topCareerId: string, score: number, scoresJson: string): void {
  const id = 'asm-' + crypto.randomUUID().slice(0, 8);
  db.prepare(`
    INSERT INTO assessments (id, user_id, top_career_id, score, scores_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, topCareerId, score, scoresJson, new Date().toISOString());
}

export function getUserAssessment(userId: string): any {
  return db.prepare('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
}

// Audit Operations
export function recordAuditLog(log: {
  userId?: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  status: string;
}): void {
  const id = 'log-' + crypto.randomUUID().slice(0, 8);
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, actor, role, action, target, ip, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    log.userId || null,
    log.actor,
    log.role,
    log.action,
    log.target,
    log.ip,
    log.status,
    new Date().toISOString()
  );
}

export function getAuditLogs(limit: number = 50): any[] {
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
}

export function getCohortAnalyticsFromDb(): any {
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.created_at, a.top_career_id, a.score, a.scores_json
    FROM users u
    LEFT JOIN assessments a ON u.id = a.user_id
    WHERE u.role = 'student'
  `).all();

  return students;
}

// Auto initialize on import
initDatabase();
