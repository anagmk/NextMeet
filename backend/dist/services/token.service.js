"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = createRefreshToken;
exports.useRefreshToken = useRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
const crypto_1 = require("crypto");
const refreshSessions = new Map();
const refreshLifetimeDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 7);
const refreshLifetimeMs = refreshLifetimeDays * 24 * 60 * 60 * 1000;
function hashToken(token) {
    return (0, crypto_1.createHash)("sha256").update(token).digest("hex");
}
function removeExpiredSessions() {
    const now = Date.now();
    for (const [tokenHash, session] of refreshSessions) {
        if (session.expiresAt <= now)
            refreshSessions.delete(tokenHash);
    }
}
function createRefreshToken(userId) {
    removeExpiredSessions();
    const token = (0, crypto_1.randomBytes)(48).toString("base64url");
    refreshSessions.set(hashToken(token), {
        userId,
        expiresAt: Date.now() + refreshLifetimeMs,
    });
    return token;
}
function useRefreshToken(token) {
    const tokenHash = hashToken(token);
    const session = refreshSessions.get(tokenHash);
    refreshSessions.delete(tokenHash); // one-time use: refresh tokens are rotated
    if (!session || session.expiresAt <= Date.now())
        return null;
    return session.userId;
}
function revokeRefreshToken(token) {
    refreshSessions.delete(hashToken(token));
}
