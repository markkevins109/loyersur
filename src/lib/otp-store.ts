/**
 * Server-side in-memory OTP store.

 * Each entry expires after 10 minutes.
 * NOTE: This is reset on server restart — acceptable for development.
 * For production, replace with a Redis or Supabase-backed store.
 */

interface OtpEntry {
  otp: string;
  expiresAt: number; // epoch ms
  attempts: number;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Generate and store a 6-digit OTP for the given email. Returns the OTP. */
export function generateOtp(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return otp;
}

/** Verify an OTP. Returns true if valid, false otherwise. */
export function verifyOtp(email: string, token: string): { valid: boolean; reason?: string } {
  const entry = store.get(email.toLowerCase());

  if (!entry) return { valid: false, reason: 'no_otp' };
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return { valid: false, reason: 'expired' };
  }

  entry.attempts += 1;

  if (entry.attempts > MAX_ATTEMPTS) {
    store.delete(email.toLowerCase());
    return { valid: false, reason: 'too_many_attempts' };
  }

  if (entry.otp !== token.trim()) {
    return { valid: false, reason: 'invalid' };
  }

  // Valid — remove from store so it can't be reused
  store.delete(email.toLowerCase());
  return { valid: true };
}
