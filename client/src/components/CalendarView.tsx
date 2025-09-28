import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";

interface Lesson {
  id: string;
  subject: string;
  dateTime: Date;
  studentName: string;
  studentColor?: string;
  duration: number;
  paymentStatus: "pending" | "paid" | "overdue";
  pricePerHour: number;
  lessonLink?: string;
}

interface CalendarViewProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onDateClick: (date: Date) => void;
  onJoinLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (lesson: Lesson) => void;
  onUpdatePaymentStatus: (lessonId: string, status: Lesson["paymentStatus"]) => void;
}

import LessonCard from "./LessonCard";


export default function CalendarView({
  lessons,
  onLessonClick,
  onDateClick,
  onJoinLesson,
  onDeleteLesson,
  onUpdatePaymentStatus,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // For month view, calculate the full calendar grid including days from previous/next months
  const calendarStart = startOfWeek(monthStart);

  // Generate exactly 42 days (6 weeks) to ensure a complete calendar grid
  const monthDays = Array.from({ length: 42 }, (_, index) =>
    addDays(calendarStart, index),
  );

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const days = view === "month" ? monthDays : weekDays;

  const getLessonsForDate = (date: Date) => {
    return lessons.filter((lesson) => isSameDay(lesson.dateTime, date));
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "lesson-confirmed";
      case "pending":
        return "lesson-pending";
      case "overdue":
        return "lesson-cancelled";
      default:
        return "secondary";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      direction === "next"
        ? addMonths(currentDate, 1)
        : subMonths(currentDate, 1),
    );
  };

  const setToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="w-full h-full" data-testid="calendar-view">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {format(currentDate, "MMMM yyyy")}
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setToToday()}
            data-testid="button-today"
          >
            Today
          </Button>

          <div className="flex rounded-md border">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              data-testid="button-month-view"
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              data-testid="button-week-view"
            >
              Week
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("prev")}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("next")}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-24 p-2 border rounded-md cursor-pointer hover-elevate
                  ${isToday ? "bg-accent" : "bg-card"}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                `}
                onClick={() => onDateClick(day)}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}
                >
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {dayLessons.slice(0, 2).map((lesson) => (
                    <div key={lesson.id} className="relative">
                      <LessonCard
                        lesson={{
                          id: lesson.id,
                          subject: lesson.subject,
                          dateTime: lesson.dateTime,
                          studentName: lesson.studentName,
                          duration: lesson.duration,
                          paymentStatus: lesson.paymentStatus as 'pending' | 'paid' | 'overdue',
                          pricePerHour: lesson.pricePerHour,
                          lessonLink: lesson.lessonLink,
                        }}
                        onEdit={() => onLessonClick(lesson)}
                        onDelete={() => onDeleteLesson?.(lesson)}
                        onJoinLesson={lesson.lessonLink ? () => onJoinLesson?.(lesson) : undefined}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                      />
                    </div>
                  ))}

                  {dayLessons.length > 2 && (
                    <div className="text-xs text-muted-foreground p-1">
                      +{dayLessons.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}