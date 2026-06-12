import { randomUUID } from "node:crypto";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

interface Session {
  userToken: string;
  userId?: string;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(userToken: string, userId?: string): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    userToken,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return undefined;
  }
  return session;
}

// Purge expired sessions — call periodically
export function purgeExpired(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now > session.expiresAt) sessions.delete(id);
  }
}
