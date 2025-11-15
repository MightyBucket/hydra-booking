import {
  students,
  lessons,
  recurringLessons,
  comments,
  notes,
  parents,
  payments,
  paymentLessons,
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
  type InsertNote,
  type Parent,
  type InsertParent,
  type Payment,
  type InsertPayment,
  type PaymentLesson,
  type InsertPaymentLesson
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
  checkLessonOverlap(dateTime: Date, duration: number, excludeLessonId?: string): Promise<boolean>;

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

  // Parent methods
  getParent(id: string): Promise<Parent | undefined>;
  getParents(): Promise<Parent[]>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: string, parent: Partial<InsertParent>): Promise<Parent | undefined>;
  deleteParent(id: string): Promise<void>;

  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  getPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment, lessonIds: string[]): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>, lessonIds?: string[]): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<void>;
  getPaymentLessons(paymentId: string): Promise<string[]>;
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

  async checkLessonOverlap(dateTime: Date, duration: number, excludeLessonId?: string): Promise<boolean> {
    const lessonStart = new Date(dateTime);
    const lessonEnd = new Date(lessonStart.getTime() + duration * 60000);

    const allLessons = await this.getLessons();

    for (const existingLesson of allLessons) {
      // Skip the lesson being updated
      if (excludeLessonId && existingLesson.id === excludeLessonId) {
        continue;
      }

      const existingStart = new Date(existingLesson.dateTime);
      const existingEnd = new Date(existingStart.getTime() + existingLesson.duration * 60000);

      // Check if there's any overlap
      if (lessonStart < existingEnd && lessonEnd > existingStart) {
        return true; // Overlap found
      }
    }

    return false; // No overlap
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    // Check for overlapping lessons
    const hasOverlap = await this.checkLessonOverlap(lesson.dateTime, lesson.duration);
    if (hasOverlap) {
      throw new Error('This time slot overlaps with an existing lesson');
    }

    const [createdLesson] = await db.insert(lessons).values(lesson).returning();
    return createdLesson;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined> {
    // Check for overlapping lessons if datetime or duration is being updated
    if (lesson.dateTime !== undefined || lesson.duration !== undefined) {
      const existing = await this.getLesson(id);
      if (!existing) {
        throw new Error('Lesson not found');
      }

      const dateTime = lesson.dateTime || existing.dateTime;
      const duration = lesson.duration || existing.duration;

      const hasOverlap = await this.checkLessonOverlap(dateTime, duration, id);
      if (hasOverlap) {
        throw new Error('This time slot overlaps with an existing lesson');
      }
    }

    const [updatedLesson] = await db.update(lessons)
      .set(lesson)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
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
      .set({
        ...updateData,
        lastEdited: new Date(),
      })
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

  // Parent methods
  async getParent(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent || undefined;
  }

  async getParents(): Promise<Parent[]> {
    return await db.select().from(parents).orderBy(parents.name);
  }

  async createParent(data: InsertParent): Promise<Parent> {
    const [parent] = await db.insert(parents).values(data).returning();
    return parent;
  }

  async updateParent(id: string, updateData: Partial<InsertParent>): Promise<Parent | undefined> {
    const [parent] = await db
      .update(parents)
      .set(updateData)
      .where(eq(parents.id, id))
      .returning();
    return parent || undefined;
  }

  async deleteParent(id: string): Promise<void> {
    await db.delete(parents).where(eq(parents.id, id));
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }

  async createPayment(payment: InsertPayment, lessonIds: string[]): Promise<Payment> {
    const [createdPayment] = await db.insert(payments).values(payment).returning();
    
    // Create payment-lesson associations
    if (lessonIds.length > 0) {
      await db.insert(paymentLessons).values(
        lessonIds.map(lessonId => ({
          paymentId: createdPayment.id,
          lessonId,
        }))
      );
    }
    
    return createdPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>, lessonIds?: string[]): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    
    // Update payment-lesson associations if provided
    if (lessonIds !== undefined) {
      // Delete existing associations
      await db.delete(paymentLessons).where(eq(paymentLessons.paymentId, id));
      
      // Create new associations
      if (lessonIds.length > 0) {
        await db.insert(paymentLessons).values(
          lessonIds.map(lessonId => ({
            paymentId: id,
            lessonId,
          }))
        );
      }
    }
    
    return updatedPayment || undefined;
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  async getPaymentLessons(paymentId: string): Promise<string[]> {
    const links = await db
      .select()
      .from(paymentLessons)
      .where(eq(paymentLessons.paymentId, paymentId));
    return links.map(link => link.lessonId);
  }
}

export const storage = new DatabaseStorage();