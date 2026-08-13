import { createHash, randomBytes } from "crypto";

type RefreshSession = {
  userId: string;
  expiresAt: number;
};

const refreshSessions = new Map<string, RefreshSession>();
const refreshLifetimeDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 7);
const refreshLifetimeMs = refreshLifetimeDays * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function removeExpiredSessions() {
  const now = Date.now();
  for (const [tokenHash, session] of refreshSessions) {
    if (session.expiresAt <= now) refreshSessions.delete(tokenHash);
  }
}

export function createRefreshToken(userId: string) {
  removeExpiredSessions();
  const token = randomBytes(48).toString("base64url");
  refreshSessions.set(hashToken(token), {
    userId,
    expiresAt: Date.now() + refreshLifetimeMs,
  });
  return token;
}

export function useRefreshToken(token: string) {
  const tokenHash = hashToken(token);
  const session = refreshSessions.get(tokenHash);
  refreshSessions.delete(tokenHash); // one-time use: refresh tokens are rotated

  if (!session || session.expiresAt <= Date.now()) return null;
  return session.userId;
}

export function revokeRefreshToken(token: string) {
  refreshSessions.delete(hashToken(token));
}
