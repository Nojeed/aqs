import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Hash a password with scrypt and a random salt. Stored as "scrypt:<salt>:<hash>". */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algo, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length || 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Reason a new password is too weak, or null when it's fine. */
export function passwordProblem(password: string) {
  if (password.length < 10) return "Use at least 10 characters.";
  if (/^(.)\1+$/.test(password)) return "Don't repeat a single character.";
  return null;
}
