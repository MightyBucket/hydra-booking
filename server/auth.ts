import { Request, Response, NextFunction } from "express";

// Simple in-memory session store (replace with proper session store in production)
const sessions = new Map<string, { userId: string; createdAt: number }>();

// Simple hardcoded credentials (replace with proper user management in production)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Henry123"; // Change this!

export function login(username: string, password: string): string | null {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
