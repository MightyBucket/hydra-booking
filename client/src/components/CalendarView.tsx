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
  duration: number;
  paymentStatus: "pending" | "paid" | "unpaid";
  pricePerHour: number;
  lessonLink?: string;
}

interface CalendarViewProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
  onDateClick: (date: Date) => void;
  onJoinLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (lesson: Lesson) => void;
}

export default function CalendarView({
  lessons,
  onLessonClick,
  onDateClick,
  onJoinLesson,
  onDeleteLesson,
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
      case "unpaid":
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
                  {dayLessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-1 rounded text-xs hover-elevate group"
                      style={{ backgroundColor: `hsl(var(--chart-2) / 0.1)` }}
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLessonClick(lesson);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">
                            {format(lesson.dateTime, "HH:mm")}
                          </span>
                        </div>
                        <div className="truncate text-muted-foreground">
                          {lesson.subject}
                        </div>
                        <div className="truncate font-medium">
                          {lesson.studentName}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs bg-${getPaymentStatusColor(lesson.paymentStatus)}`}
                        >
                          {lesson.paymentStatus}
                        </Badge>
                      </div>

                      {/* Action buttons - shown on hover */}
                      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onJoinLesson && lesson.lessonLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            //className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJoinLesson(lesson);
                            }}
                            data-testid={`button-join-lesson-${lesson.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                          </Button>
                        )}
                        {onDeleteLesson && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLesson(lesson);
                            }}
                            data-testid={`button-delete-lesson-${lesson.id}`}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {dayLessons.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayLessons.length - 3} more
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
