import { Request, Response, NextFunction } from "express";

// WARNING: In-memory session store - sessions will be lost on server restart
// For production, use Redis, PostgreSQL, or another persistent session store
const sessions = new Map<string, { userId: string; createdAt: number }>();

// Use environment variables in production, fall back to defaults in development
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Henry123";

export function login(username: string, password: string): string | null {
  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD) {
    const sessionId = Math.random().toString(36).substring(2);
    sessions.set(sessionId, {
      userId: "admin",
      createdAt: Date.now(),
    });
    return sessionId;
  }
  return null;
}

export function logout(sessionId: string): void {
  sessions.delete(sessionId);
}

export function validateSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  // Optional: Expire sessions after 24 hours
  const twentyFourHours = 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > twentyFourHours) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");

  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
