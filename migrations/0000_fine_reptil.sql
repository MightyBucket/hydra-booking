CREATE TABLE "lessons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"date_time" timestamp NOT NULL,
	"student_id" varchar NOT NULL,
	"lesson_link" text,
	"price_per_hour" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_lessons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_lesson_id" varchar NOT NULL,
	"frequency" text NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone_number" text,
	"default_subject" text NOT NULL,
	"default_rate" numeric(10, 2) NOT NULL,
	"default_link" text NOT NULL,
	"default_color" text DEFAULT '#3b82f6' NOT NULL,
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_lessons" ADD CONSTRAINT "recurring_lessons_template_lesson_id_lessons_id_fk" FOREIGN KEY ("template_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;