import {
  students,
  lessons,
  recurringLessons,
  type Student,
  type InsertStudent,
  type Lesson,
  type InsertLesson,
  type RecurringLesson,
  type InsertRecurringLesson,
  type User,
  type InsertUser
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
}

export const storage = new DatabaseStorage();