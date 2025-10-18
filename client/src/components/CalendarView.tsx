import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
//import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Download,
} from "lucide-react";
import { useDeleteComment } from "@/hooks/useComments";
import LessonWithComments from "@/components/LessonWithComments";
import ScheduleCommentsDialog from "@/components/ScheduleCommentsDialog";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
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
  paymentStatus: "pending" | "paid" | "unpaid" | "free";
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
  onAddComment?: (lessonId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => void;
  focusedStudentId?: string;
}

export default function CalendarView({
  lessons,
  onLessonClick,
  onDateClick,
  onJoinLesson,
  onDeleteLesson,
  onUpdatePaymentStatus,
  onAddComment,
  onEditComment,
  focusedStudentId,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedMobileDate, setSelectedMobileDate] = useState<Date | null>(
    null,
  );
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [lastTapDate, setLastTapDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<
    string | null
  >(null);

  const deleteCommentMutation = useDeleteComment();

  const monthStart = startOfMonth(currentDate);
  //const monthEnd = endOfMonth(currentDate);

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

  {/*const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-lesson-confirmed text-white";
      case "pending":
        return "bg-lesson-pending text-black";
      case "unpaid":
        return "bg-lesson-cancelled text-white";
      case "free":
        return "bg-gray-400 text-white";
      default:
        return "bg-secondary";
    }
  };*/}

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

  const handleMobileDateClick = (date: Date) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    // Check if this is a double-tap on the same date
    if (
      !focusedStudentId &&
      lastTapDate &&
      isSameDay(lastTapDate, date) &&
      now - lastTapTime < DOUBLE_TAP_DELAY
    ) {
      // Double-tap detected - open booking form
      onDateClick(date);
      // Reset tap tracking
      setLastTapTime(0);
      setLastTapDate(null);
    } else {
      // Single tap - just select the date
      setSelectedMobileDate(date);
      setLastTapTime(now);
      setLastTapDate(date);
    }
  };

  const selectedMobileLessons = selectedMobileDate
    ? getLessonsForDate(selectedMobileDate)
    : [];

  const handleSyncToCalendar = () => {
    const token = localStorage.getItem("sessionId");
    const baseUrl = window.location.origin;
    const icsUrl = `${baseUrl}/api/calendar/ics`;

    // Create a temporary link to download the .ics file
    const link = document.createElement("a");
    link.href = icsUrl;
    link.setAttribute("download", "lessons.ics");

    // Add authorization header via fetch and trigger download
    fetch(icsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading calendar:", error);
      });
  };

  return (
    <>
      <Card className="w-full h-full" data-testid="calendar-view">
        <CardHeader className="space-y-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {!focusedStudentId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncToCalendar}
                  data-testid="button-sync-calendar"
                  className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sync to Calendar</span>
                  <span className="sm:hidden ml-1">Sync</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setToToday()}
                data-testid="button-today"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
              >
                Today
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                data-testid="button-prev-month"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                data-testid="button-next-month"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

      <CardContent className={isMobile ? "px-2 pb-0" : ""}>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2 sm:mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-1 sm:p-2 text-center text-[10px] sm:text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {days.map((day) => {
            const dayLessons = getLessonsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected =
              selectedMobileDate && isSameDay(day, selectedMobileDate);

            return (
              <div
                key={day.toISOString()}
                className={`
                  ${isMobile ? "min-h-11 p-0.5" : "min-h-16 sm:min-h-24 p-1 sm:p-2"} border rounded-sm cursor-pointer hover-elevate
                  ${isToday ? "bg-accent" : "bg-card"}
                  ${isSelected && isMobile ? "ring-2 ring-primary" : ""}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                `}
                onClick={() =>
                  isMobile ? handleMobileDateClick(day) : onDateClick(day)
                }
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div
                  className={`${isMobile ? "text-[9px]" : "text-[10px] sm:text-sm"} font-medium mb-0.5 sm:mb-1 ${isToday ? "text-primary" : ""}`}
                >
                  {format(day, "d")}
                </div>

                {isMobile ? (
                  <div className="space-y-[2px]">
                    {dayLessons.slice(0, 2).map((lesson) => {
                      const isOtherStudent =
                        focusedStudentId &&
                        lesson.studentId !== focusedStudentId;

                      return (
                        <div
                          key={lesson.id}
                          className="h-1 rounded-full"
                          style={{
                            backgroundColor: isOtherStudent
                              ? "#9ca3af"
                              : lesson.studentColor || "#3b82f6",
                          }}
                        />
                      );
                    })}
                    {dayLessons.length > 2 && (
                      <div className="text-[8px] text-muted-foreground text-center">
                        +{dayLessons.length - 2}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayLessons.slice(0, 3).map((lesson) => {
                      const isOtherStudent = focusedStudentId && lesson.studentId !== focusedStudentId;

                      if (isOtherStudent) {
                        return (
                          <div
                            key={lesson.id}
                            className="p-0.5 sm:p-1 rounded text-[9px] sm:text-xs bg-muted border-l-2 border-l-muted-foreground/30"
                            data-testid={`lesson-blocked-${lesson.id}`}
                          >
                            <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
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
                        <LessonWithComments
                          key={lesson.id}
                          lesson={lesson}
                          onEdit={() => onLessonClick(lesson)}
                          onDelete={onDeleteLesson ? () => onDeleteLesson(lesson) : undefined}
                          onJoinLesson={
                            onJoinLesson && lesson.lessonLink
                              ? () => onJoinLesson(lesson)
                              : undefined
                          }
                          onUpdatePaymentStatus={onUpdatePaymentStatus}
                          onAddComment={
                            onAddComment
                              ? () => onAddComment(lesson.id)
                              : undefined
                          }
                          isStudentView={!!focusedStudentId}
                          onViewComments={setViewCommentsLessonId}
                          onEditComment={onEditComment}
                        />
                      );
                    })}

                    {dayLessons.length > 3 && (
                      <div className="text-[9px] sm:text-xs text-muted-foreground">
                        +{dayLessons.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isMobile && selectedMobileDate && (
          <div className="mt-4 pt-4 pb-4 px-4 -mx-2 border-t border-x border-b rounded-b-lg bg-card">
            <h3 className="text-sm font-semibold mb-3">
              {format(selectedMobileDate, "EEEE, MMMM d")}
              {selectedMobileLessons.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({selectedMobileLessons.length}{" "}
                  {selectedMobileLessons.length === 1 ? "lesson" : "lessons"})
                </span>
              )}
            </h3>
            {selectedMobileLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No lessons scheduled
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedMobileLessons.map((lesson) => {
                  const isOtherStudent =
                    focusedStudentId && lesson.studentId !== focusedStudentId;

                  if (isOtherStudent) {
                    return (
                      <div
                        key={lesson.id}
                        className="p-2 rounded border bg-muted/50"
                      >
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="h-4 w-4" />
                          <span>
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
                    <LessonWithComments
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={() => onLessonClick(lesson)}
                      onDelete={onDeleteLesson ? () => onDeleteLesson(lesson) : undefined}
                      onJoinLesson={
                        onJoinLesson && lesson.lessonLink
                          ? () => onJoinLesson(lesson)
                          : undefined
                      }
                      onUpdatePaymentStatus={onUpdatePaymentStatus}
                      onAddComment={
                        onAddComment ? () => onAddComment(lesson.id) : undefined
                      }
                      isStudentView={!!focusedStudentId}
                      onViewComments={setViewCommentsLessonId}
                      onEditComment={onEditComment}
                    />
                  );
                })}
              </div>
            )}
            {!focusedStudentId && (
              <Button
                className="w-full mt-4"
                onClick={() => onDateClick(selectedMobileDate)}
                data-testid="button-book-lesson-mobile"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Lesson
              </Button>
            )}
          </div>
        )}
      </CardContent>
      </Card>

      <ScheduleCommentsDialog
        lessonId={viewCommentsLessonId}
        onClose={() => setViewCommentsLessonId(null)}
        onDeleteComment={async (commentId) => {
          try {
            await deleteCommentMutation.mutateAsync(commentId);
          } catch (error) {
            console.error("Error deleting comment:", error);
          }
        }}
        onEditComment={onEditComment}
        isStudentView={!!focusedStudentId}
      />
    </>
  );
}
