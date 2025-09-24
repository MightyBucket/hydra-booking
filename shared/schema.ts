import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  defaultSubject: text("default_subject"),
  defaultRate: decimal("default_rate", { precision: 10, scale: 2 }),
  defaultLink: text("default_link"),
});

// Lessons table
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  dateTime: timestamp("date_time").notNull(),
  studentId: varchar("student_id").notNull().references(() => students.id),
  lessonLink: text("lesson_link"),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, overdue
});

// Recurring lessons table
export const recurringLessons = pgTable("recurring_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateLessonId: varchar("template_lesson_id").notNull().references(() => lessons.id),
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly
  endDate: timestamp("end_date"),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  student: one(students, {
    fields: [lessons.studentId],
    references: [students.id],
  }),
  recurringLessons: many(recurringLessons),
}));

export const recurringLessonsRelations = relations(recurringLessons, ({ one }) => ({
  templateLesson: one(lessons, {
    fields: [recurringLessons.templateLessonId],
    references: [lessons.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertRecurringLessonSchema = createInsertSchema(recurringLessons).omit({
  id: true,
});

// Types
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type InsertRecurringLesson = z.infer<typeof insertRecurringLessonSchema>;
export type RecurringLesson = typeof recurringLessons.$inferSelect;

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
