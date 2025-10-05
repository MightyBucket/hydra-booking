import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  ChevronDown,
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
  studentId?: string;
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
  onUpdatePaymentStatus: (
    lessonId: string,
    status: Lesson["paymentStatus"],
  ) => void;
  focusedStudentId?: string;
}

// Mock LessonCard component for demonstration purposes
// In a real scenario, this would be imported from "@/components/LessonCard"
const LessonCard = ({
  lesson,
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
}: {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  onJoinLesson?: () => void;
  onUpdatePaymentStatus: (
    lessonId: string,
    status: Lesson["paymentStatus"],
  ) => void;
}) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-lesson-confirmed text-white";
      case "pending":
        return "bg-lesson-pending text-black";
      case "unpaid":
        return "bg-lesson-cancelled text-white";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div
      className="p-1 rounded text-xs hover-elevate group border-l-2"
      style={{
        backgroundColor: `${lesson.studentColor}15`,
        borderLeftColor: lesson.studentColor || "#3b82f6",
      }}
      data-testid={`lesson-${lesson.id}`}
    >
      <div className="cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="truncate">
            {format(lesson.dateTime, "HH:mm")}-
            {format(
              new Date(lesson.dateTime.getTime() + lesson.duration * 60000),
              "HH:mm",
            )}
          </span>
        </div>
        <div className="truncate text-muted-foreground">{lesson.subject}</div>
        <div className="truncate font-medium">{lesson.studentName}</div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 px-2 py-0.5 h-auto text-xs font-medium mt-1`}
              onClick={(e) => e.stopPropagation()}
              data-testid={`dropdown-payment-status-${lesson.id}`}
            >
              {lesson.paymentStatus}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-24">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePaymentStatus(lesson.id, "pending");
              }}
              className={lesson.paymentStatus === "pending" ? "bg-accent" : ""}
              data-testid={`payment-option-pending-${lesson.id}`}
            >
              <span className="w-3 h-3 rounded-full bg-lesson-pending mr-2"></span>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePaymentStatus(lesson.id, "paid");
              }}
              className={lesson.paymentStatus === "paid" ? "bg-accent" : ""}
              data-testid={`payment-option-paid-${lesson.id}`}
            >
              <span className="w-3 h-3 rounded-full bg-lesson-confirmed mr-2"></span>
              Paid
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePaymentStatus(lesson.id, "unpaid");
              }}
              className={lesson.paymentStatus === "unpaid" ? "bg-accent" : ""}
              data-testid={`payment-option-unpaid-${lesson.id}`}
            >
              <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
              Unpaid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onJoinLesson && lesson.lessonLink && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onJoinLesson();
            }}
            data-testid={`button-join-lesson-${lesson.id}`}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            data-testid={`button-delete-lesson-${lesson.id}`}
          >
            <Trash2 className="h-3 w-3 mr-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function CalendarView({
  lessons,
  onLessonClick,
  onDateClick,
  onJoinLesson,
  onDeleteLesson,
  onUpdatePaymentStatus,
  focusedStudentId,
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
    return lessons
      .filter((lesson) => isSameDay(lesson.dateTime, date))
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-lesson-confirmed text-white";
      case "pending":
        return "bg-lesson-pending text-black";
      case "unpaid":
        return "bg-lesson-cancelled text-white";
      default:
        return "bg-secondary";
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
                  {dayLessons.slice(0, 3).map((lesson) => {
                    const isOtherStudent = focusedStudentId && lesson.studentId !== focusedStudentId;

                    if (isOtherStudent) {
                      return (
                        <div
                          key={lesson.id}
                          className="p-1 rounded text-xs bg-muted border-l-2 border-l-muted-foreground/30"
                          data-testid={`lesson-blocked-${lesson.id}`}
                        >
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="truncate">
                              {format(lesson.dateTime, "HH:mm")}-
                              {format(
                                new Date(
                                  lesson.dateTime.getTime() +
                                    lesson.duration * 60000,
                                ),
                                "HH:mm",
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={lesson.id}
                        className="p-1 rounded text-xs hover-elevate group border-l-2"
                        style={{
                          backgroundColor: `${lesson.studentColor}15`,
                          borderLeftColor: lesson.studentColor || "#3b82f6",
                        }}
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
                              {format(lesson.dateTime, "HH:mm")}-
                              {format(
                                new Date(
                                  lesson.dateTime.getTime() +
                                    lesson.duration * 60000,
                                ),
                                "HH:mm",
                              )}{" "}
                              ()
                            </span>
                          </div>
                          <div className="truncate text-muted-foreground">
                            {lesson.subject}
                          </div>
                          <div className="truncate font-medium">
                            {lesson.studentName}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 cursor-pointer mt-1`}
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`dropdown-payment-status-${lesson.id}`}
                              >
                                {lesson.paymentStatus}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="min-w-24"
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdatePaymentStatus(lesson.id, "pending");
                                }}
                                className={
                                  lesson.paymentStatus === "pending"
                                    ? "bg-accent"
                                    : ""
                                }
                                data-testid={`payment-option-pending-${lesson.id}`}
                              >
                                <span className="w-3 h-3 rounded-full bg-lesson-pending mr-2"></span>
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdatePaymentStatus(lesson.id, "paid");
                                }}
                                className={
                                  lesson.paymentStatus === "paid"
                                    ? "bg-accent"
                                    : ""
                                }
                                data-testid={`payment-option-paid-${lesson.id}`}
                              >
                                <span className="w-3 h-3 rounded-full bg-lesson-confirmed mr-2"></span>
                                Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdatePaymentStatus(lesson.id, "unpaid");
                                }}
                                className={
                                  lesson.paymentStatus === "unpaid"
                                    ? "bg-accent"
                                    : ""
                                }
                                data-testid={`payment-option-unpaid-${lesson.id}`}
                              >
                                <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
                                Unpaid
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Action buttons - shown on hover */}
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onJoinLesson && lesson.lessonLink && (
                            <Button
                              size="sm"
                              variant="outline"
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
                    );
                  })}

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
