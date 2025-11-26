import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Parents table
export const parents = pgTable("parents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique(),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id", { length: 6 }).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").unique(),
  phoneNumber: text("phone_number"),
  defaultSubject: text("default_subject").notNull(),
  defaultRate: decimal("default_rate", { precision: 10, scale: 2 }).notNull(),
  defaultLink: text("default_link").notNull(),
  defaultColor: text("default_color").notNull().default("#3b82f6"), // Default blue color
  parentId: varchar("parent_id").references(() => parents.id, { onDelete: 'set null' }),
});

// Lessons table
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  dateTime: timestamp("date_time").notNull(),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  lessonLink: text("lesson_link"),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, unpaid, free, cancelled
});

// Recurring lessons table
export const recurringLessons = pgTable("recurring_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateLessonId: varchar("template_lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly
  endDate: timestamp("end_date"),
});

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  visibleToStudent: integer("visible_to_student").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  lastEdited: timestamp("last_edited"),
});

// Comment-Tags junction table
export const commentTags = pgTable("comment_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => comments.id, { onDelete: 'cascade' }),
  tagId: varchar("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

// Notes table
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payerType: text("payer_type").notNull(), // 'student' or 'parent'
  payerId: varchar("payer_id").notNull(), // references either student or parent id
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Payment-Lesson junction table (many-to-many relationship)
export const paymentLessons = pgTable("payment_lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").notNull().references(() => payments.id, { onDelete: 'cascade' }),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
});

// Relations
export const parentsRelations = relations(parents, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  lessons: many(lessons),
  notes: many(notes),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  student: one(students, {
    fields: [lessons.studentId],
    references: [students.id],
  }),
  recurringLessons: many(recurringLessons),
  comments: many(comments),
}));

export const recurringLessonsRelations = relations(recurringLessons, ({ one }) => ({
  templateLesson: one(lessons, {
    fields: [recurringLessons.templateLessonId],
    references: [lessons.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [comments.lessonId],
    references: [lessons.id],
  }),
  commentTags: many(commentTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  commentTags: many(commentTags),
}));

export const commentTagsRelations = relations(commentTags, ({ one }) => ({
  comment: one(comments, {
    fields: [commentTags.commentId],
    references: [comments.id],
  }),
  tag: one(tags, {
    fields: [commentTags.tagId],
    references: [tags.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  student: one(students, {
    fields: [notes.studentId],
    references: [students.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ many }) => ({
  paymentLessons: many(paymentLessons),
}));

export const paymentLessonsRelations = relations(paymentLessons, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentLessons.paymentId],
    references: [payments.id],
  }),
  lesson: one(lessons, {
    fields: [paymentLessons.lessonId],
    references: [lessons.id],
  }),
}));

// Helper to transform empty strings to null
const emptyStringToNull = z.string().transform(val => val === '' ? null : val).nullable().optional();

// Insert schemas for parents
export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  email: z.preprocess(
    val => val === '' ? null : val,
    z.string().email().nullable().optional()
  ),
  phoneNumber: emptyStringToNull,
});

// Insert schemas  
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  studentId: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  defaultSubject: z.string().min(1, "Default subject is required"),
  defaultRate: z.string().min(1, "Default rate is required"),
  defaultLink: z.string().url("Default lesson link must be a valid URL"),
  defaultColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
  lastName: emptyStringToNull,
  email: z.preprocess(
    val => val === '' ? null : val,
    z.string().email().nullable().optional()
  ),
  phoneNumber: emptyStringToNull,
  parentId: z.string().nullable().optional(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
}).extend({
  dateTime: z.coerce.date(),
  pricePerHour: z.coerce.number(),
  duration: z.coerce.number().int().positive(),
  lessonLink: z.preprocess(
    val => val === '' || val === null || val === undefined ? null : val,
    z.union([z.string().url(), z.null()]).optional()
  ),
});

export const insertRecurringLessonSchema = createInsertSchema(recurringLessons).omit({
  id: true,
}).extend({
  endDate: z.coerce.date(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Comment is required"),
  visibleToStudent: z.number().int().min(0).max(1),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
});

export const insertCommentTagSchema = createInsertSchema(commentTags).omit({
  id: true,
});

// Types
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type InsertRecurringLesson = z.infer<typeof insertRecurringLessonSchema>;
export type RecurringLesson = typeof recurringLessons.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertCommentTag = z.infer<typeof insertCommentTagSchema>;
export type CommentTag = typeof commentTags.$inferSelect;

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Note content is required"),
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parents.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  payerType: z.enum(['student', 'parent']),
  payerId: z.string().min(1, "Payer is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.coerce.date(),
  notes: emptyStringToNull,
});

export const insertPaymentLessonSchema = createInsertSchema(paymentLessons).omit({
  id: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPaymentLesson = z.infer<typeof insertPaymentLessonSchema>;
export type PaymentLesson = typeof paymentLessons.$inferSelect;

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
