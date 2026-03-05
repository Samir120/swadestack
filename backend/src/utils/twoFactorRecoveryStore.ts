import crypto from 'crypto';

interface RecoveryEntry {
  code: string;
  expiresAt: Date;
  attempts: number;
}

const store = new Map<string, RecoveryEntry>();

const MAX_ATTEMPTS = 3;
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function generateRecoveryCode(userId: string): string {
  const code = crypto.randomInt(100000, 999999).toString();
  store.set(userId, {
    code,
    expiresAt: new Date(Date.now() + EXPIRY_MS),
    attempts: 0,
  });
  return code;
}

export function verifyRecoveryCode(userId: string, inputCode: string): boolean {
  const entry = store.get(userId);
  if (!entry) return false;

  if (entry.expiresAt < new Date()) {
    store.delete(userId);
    return false;
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(userId);
    return false;
  }

  if (entry.code !== inputCode) {
    entry.attempts++;
    return false;
  }

  store.delete(userId);
  return true;
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = new Date();
  for (const [userId, entry] of store.entries()) {
    if (entry.expiresAt < now) {
      store.delete(userId);
    }
  }
}, CLEANUP_INTERVAL_MS);
