import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertLessonSchema, insertRecurringLessonSchema } from "@shared/schema";
import { z } from "zod";
import { login, logout, requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const sessionId = login(username, password);
      
      if (!sessionId) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ sessionId });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (sessionId) {
        logout(sessionId);
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/validate", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (!sessionId) {
        return res.status(401).json({ authenticated: false });
      }
      
      const { validateSession } = await import('./auth');
      const isValid = validateSession(sessionId);
      
      res.json({ authenticated: isValid });
    } catch (error) {
      console.error('Error validating session:', error);
      res.status(500).json({ error: "Validation failed" });
    }
  });

  // Student routes (read endpoints are public for student calendar view, write endpoints are protected)
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.post("/api/students", requireAuth, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error('Error creating student:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, updateData);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error('Error updating student:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Lesson routes (read endpoints are public for student calendar view, write endpoints are protected)
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  app.get("/api/students/:studentId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByStudent(req.params.studentId);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching student lessons:', error);
      res.status(500).json({ error: "Failed to fetch student lessons" });
    }
  });

  app.post("/api/lessons", requireAuth, async (req, res) => {
    try {
      const validatedData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validatedData);
      res.status(201).json(lesson);
    } catch (error) {
      console.error('Error creating lesson:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  app.put("/api/lessons/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(req.params.id, updateData);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error('Error updating lesson:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  app.delete("/api/lessons/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });

  // Recurring lesson routes (protected)
  app.get("/api/recurring-lessons", requireAuth, async (req, res) => {
    try {
      const recurringLessons = await storage.getRecurringLessons();
      res.json(recurringLessons);
    } catch (error) {
      console.error('Error fetching recurring lessons:', error);
      res.status(500).json({ error: "Failed to fetch recurring lessons" });
    }
  });

  app.get("/api/recurring-lessons/:id", requireAuth, async (req, res) => {
    try {
      const recurringLesson = await storage.getRecurringLesson(req.params.id);
      if (!recurringLesson) {
        return res.status(404).json({ error: "Recurring lesson not found" });
      }
      res.json(recurringLesson);
    } catch (error) {
      console.error('Error fetching recurring lesson:', error);
      res.status(500).json({ error: "Failed to fetch recurring lesson" });
    }
  });

  app.post("/api/recurring-lessons", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRecurringLessonSchema.parse(req.body);
      const recurringLesson = await storage.createRecurringLesson(validatedData);
      res.status(201).json(recurringLesson);
    } catch (error) {
      console.error('Error creating recurring lesson:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create recurring lesson" });
    }
  });

  app.put("/api/recurring-lessons/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertRecurringLessonSchema.partial().parse(req.body);
      const recurringLesson = await storage.updateRecurringLesson(req.params.id, updateData);
      if (!recurringLesson) {
        return res.status(404).json({ error: "Recurring lesson not found" });
      }
      res.json(recurringLesson);
    } catch (error) {
      console.error('Error updating recurring lesson:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update recurring lesson" });
    }
  });

  app.delete("/api/recurring-lessons/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteRecurringLesson(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting recurring lesson:', error);
      res.status(500).json({ error: "Failed to delete recurring lesson" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
