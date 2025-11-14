import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertStudentSchema, insertLessonSchema, insertRecurringLessonSchema } from "@shared/schema";
import { z } from "zod";
import { login, logout, requireAuth } from "./auth";

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", authLimiter, async (req, res) => {
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

  // Student routes (global endpoint requires auth, individual student endpoint is public)
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get single student by their 6-digit studentId (public for student view)
  app.get("/api/student/:studentId", async (req, res) => {
    try {
      const students = await storage.getStudents();
      const student = students.find((s: any) => s.studentId === req.params.studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: "Failed to fetch student" });
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

  // Parent routes (protected)
  app.get("/api/parents", requireAuth, async (req, res) => {
    try {
      const parents = await storage.getParents();
      res.json(parents);
    } catch (error) {
      console.error('Error fetching parents:', error);
      res.status(500).json({ error: "Failed to fetch parents" });
    }
  });

  app.get("/api/parents/:id", requireAuth, async (req, res) => {
    try {
      const parent = await storage.getParent(req.params.id);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error) {
      console.error('Error fetching parent:', error);
      res.status(500).json({ error: "Failed to fetch parent" });
    }
  });

  app.post("/api/parents", requireAuth, async (req, res) => {
    try {
      const { insertParentSchema } = await import('@shared/schema');
      const validatedData = insertParentSchema.parse(req.body);
      const parent = await storage.createParent(validatedData);
      res.status(201).json(parent);
    } catch (error) {
      console.error('Error creating parent:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create parent" });
    }
  });

  app.put("/api/parents/:id", requireAuth, async (req, res) => {
    try {
      const { insertParentSchema } = await import('@shared/schema');
      const updateData = insertParentSchema.partial().parse(req.body);
      const parent = await storage.updateParent(req.params.id, updateData);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      res.json(parent);
    } catch (error) {
      console.error('Error updating parent:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update parent" });
    }
  });

  app.delete("/api/parents/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteParent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting parent:', error);
      res.status(500).json({ error: "Failed to delete parent" });
    }
  });

  // Lesson routes (global endpoint requires auth, student-specific endpoint is public)
  app.get("/api/lessons", requireAuth, async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // Get lessons filtered by student's 6-digit studentId (public for student view)
  app.get("/api/student/:studentId/lessons", async (req, res) => {
    try {
      // Find student by their 6-digit studentId
      const students = await storage.getStudents();
      const student = students.find((s: any) => s.studentId === req.params.studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      // Get lessons for this student
      const studentLessons = await storage.getLessonsByStudent(student.id);
      
      // Get all lessons to find blocked slots
      const allLessons = await storage.getLessons();
      
      // Create blocked slots for other students' lessons (only time and duration)
      const blockedSlots = allLessons
        .filter((lesson: any) => lesson.studentId !== student.id)
        .map((lesson: any) => ({
          dateTime: lesson.dateTime,
          duration: lesson.duration,
          isBlocked: true
        }));
      
      // Combine student lessons with blocked slots
      const response = {
        lessons: studentLessons,
        blockedSlots: blockedSlots
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching student lessons:', error);
      res.status(500).json({ error: "Failed to fetch student lessons" });
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
      const preprocessedData = {
        ...req.body,
        pricePerHour: parseFloat(req.body.pricePerHour),
        duration: parseInt(req.body.duration, 10),
      };
      
      const validatedData = insertLessonSchema.parse(preprocessedData);
      const lesson = await storage.createLesson(validatedData);
      res.status(201).json(lesson);
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      if (error.message === 'This time slot overlaps with an existing lesson') {
        return res.status(409).json({ error: error.message });
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
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      if (error.message === 'This time slot overlaps with an existing lesson') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Lesson not found') {
        return res.status(404).json({ error: error.message });
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

  // Comment routes (read endpoints are public for student view, write endpoints are protected)
  app.get("/api/lessons/:lessonId/comments", async (req, res) => {
    try {
      const allComments = await storage.getCommentsByLesson(req.params.lessonId);
      
      // Check if user is authenticated
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { validateSession } = await import('./auth');
      const isAuthenticated = sessionId ? validateSession(sessionId) : false;
      
      // If not authenticated, only return comments visible to students
      const comments = isAuthenticated 
        ? allComments 
        : allComments.filter(comment => comment.visibleToStudent === 1);
      
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Get comments for lessons belonging to a specific student (public for student view)
  app.get("/api/student/:studentId/lessons/:lessonId/comments", async (req, res) => {
    try {
      // Find student by their 6-digit studentId
      const students = await storage.getStudents();
      const student = students.find((s: any) => s.studentId === req.params.studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      // Verify lesson belongs to this student
      const lesson = await storage.getLesson(req.params.lessonId);
      if (!lesson || lesson.studentId !== student.id) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      
      // Get comments visible to student only
      const allComments = await storage.getCommentsByLesson(req.params.lessonId);
      const comments = allComments.filter(comment => comment.visibleToStudent === 1);
      
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/lessons/:lessonId/comments", requireAuth, async (req, res) => {
    try {
      const { insertCommentSchema } = await import('@shared/schema');
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        lessonId: req.params.lessonId,
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.put("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const { insertCommentSchema } = await import('@shared/schema');
      const updateData = insertCommentSchema.partial().parse(req.body);
      const comment = await storage.updateComment(req.params.id, updateData);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Notes routes (protected)
  app.get("/api/students/:studentId/notes", requireAuth, async (req, res) => {
    try {
      const notes = await storage.getNotesByStudent(req.params.studentId);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/students/:studentId/notes", requireAuth, async (req, res) => {
    try {
      const { insertNoteSchema } = await import('@shared/schema');
      const validatedData = insertNoteSchema.parse({
        ...req.body,
        studentId: req.params.studentId,
      });
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const { insertNoteSchema } = await import('@shared/schema');
      const updateData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(req.params.id, updateData);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error('Error updating note:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // iCalendar endpoint for calendar sync
  app.get("/api/calendar/ics", requireAuth, async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      const students = await storage.getStudents();
      
      // Filter lessons for next two months
      const now = new Date();
      const twoMonthsLater = new Date();
      twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
      
      const filteredLessons = lessons.filter((lesson: any) => {
        const lessonDate = new Date(lesson.dateTime);
        return lessonDate >= now && lessonDate <= twoMonthsLater;
      });

      // Generate iCalendar format
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Lesson Scheduler//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Lesson Schedule',
        'X-WR-TIMEZONE:UTC',
      ];

      filteredLessons.forEach((lesson: any) => {
        const student = students.find((s: any) => s.id === lesson.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName || ''}`.trim() : 'Unknown Student';
        
        const startDate = new Date(lesson.dateTime);
        const endDate = new Date(startDate.getTime() + lesson.duration * 60000);
        
        // Format dates to iCalendar format (YYYYMMDDTHHMMSSZ)
        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const now = new Date();
        const dtstamp = formatDate(now);
        
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${lesson.id}@lessonscheduler`);
        icsContent.push(`DTSTAMP:${dtstamp}`);
        icsContent.push(`DTSTART:${formatDate(startDate)}`);
        icsContent.push(`DTEND:${formatDate(endDate)}`);
        icsContent.push(`SUMMARY:${lesson.subject} - ${studentName}`);
        icsContent.push(`DESCRIPTION:Duration: ${lesson.duration} minutes\\nPrice: £${lesson.pricePerHour}/hr\\nStatus: ${lesson.paymentStatus}`);
        
        if (lesson.lessonLink) {
          icsContent.push(`URL:${lesson.lessonLink}`);
        }
        
        icsContent.push('END:VEVENT');
      });

      icsContent.push('END:VCALENDAR');

      const icsString = icsContent.join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="lessons.ics"');
      res.send(icsString);
    } catch (error) {
      console.error('Error generating calendar:', error);
      res.status(500).json({ error: "Failed to generate calendar" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
