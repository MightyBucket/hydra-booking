import {
  students,
  lessons,
  recurringLessons,
  comments,
  notes,
  type Student,
  type InsertStudent,
  type Lesson,
  type InsertLesson,
  type RecurringLesson,
  type InsertRecurringLesson,
  type Comment,
  type InsertComment,
  type User,
  type InsertUser,
  type Note,
  type InsertNote
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Generate a unique 6-digit student ID
async function generateUniqueStudentId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // Generate random 6-digit number
    const studentId = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if it already exists
    const existing = await db.select().from(students).where(eq(students.studentId, studentId));

    if (existing.length === 0) {
      return studentId;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique student ID after multiple attempts');
}

export interface IStorage {
  // Legacy user methods for compatibility
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student methods
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<void>;

  // Lesson methods
  getLesson(id: string): Promise<Lesson | undefined>;
  getLessons(): Promise<Lesson[]>;
  getLessonsByStudent(studentId: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<void>;

  // Recurring lesson methods
  getRecurringLesson(id: string): Promise<RecurringLesson | undefined>;
  getRecurringLessons(): Promise<RecurringLesson[]>;
  createRecurringLesson(recurringLesson: InsertRecurringLesson): Promise<RecurringLesson>;
  updateRecurringLesson(id: string, recurringLesson: Partial<InsertRecurringLesson>): Promise<RecurringLesson | undefined>;
  deleteRecurringLesson(id: string): Promise<void>;

  // Comment methods
  getComment(id: string): Promise<Comment | undefined>;
  getCommentsByLesson(lessonId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<void>;

  // Notes methods
  getNotesByStudent(studentId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    // Legacy implementation - in a real app you might not need this
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Legacy implementation - in a real app you might not need this
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Legacy implementation - in a real app you might not need this
    throw new Error("User creation not implemented");
  }

  // Student methods
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.firstName, students.lastName);
  }

  async createStudent(data: InsertStudent): Promise<Student> {
    const studentId = await generateUniqueStudentId();
    const [student] = await db.insert(students).values({ ...data, studentId }).returning();
    return student;
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Lesson methods
  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(desc(lessons.dateTime));
  }

  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.studentId, studentId))
      .orderBy(desc(lessons.dateTime));
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values(insertLesson).returning();
    return lesson;
  }

  async updateLesson(id: string, updateData: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const [lesson] = await db
      .update(lessons)
      .set(updateData)
      .where(eq(lessons.id, id))
      .returning();
    return lesson || undefined;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Recurring lesson methods
  async getRecurringLesson(id: string): Promise<RecurringLesson | undefined> {
    const [recurringLesson] = await db
      .select()
      .from(recurringLessons)
      .where(eq(recurringLessons.id, id));
    return recurringLesson || undefined;
  }

  async getRecurringLessons(): Promise<RecurringLesson[]> {
    return await db.select().from(recurringLessons);
  }

  async createRecurringLesson(insertRecurringLesson: InsertRecurringLesson): Promise<RecurringLesson> {
    const [recurringLesson] = await db
      .insert(recurringLessons)
      .values(insertRecurringLesson)
      .returning();
    return recurringLesson;
  }

  async updateRecurringLesson(
    id: string,
    updateData: Partial<InsertRecurringLesson>
  ): Promise<RecurringLesson | undefined> {
    const [recurringLesson] = await db
      .update(recurringLessons)
      .set(updateData)
      .where(eq(recurringLessons.id, id))
      .returning();
    return recurringLesson || undefined;
  }

  async deleteRecurringLesson(id: string): Promise<void> {
    await db.delete(recurringLessons).where(eq(recurringLessons.id, id));
  }

  // Comment methods
  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getCommentsByLesson(lessonId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.lessonId, lessonId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: string, updateData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, id))
      .returning();
    return comment || undefined;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Notes methods
  async getNotesByStudent(studentId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.studentId, studentId));
  }

  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db.update(notes).set(note).where(eq(notes.id, id)).returning();
    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }
}

export const storage = new DatabaseStorage();