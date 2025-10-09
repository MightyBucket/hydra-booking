import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  ChevronDown,
  MessageSquare,
  Download,
} from "lucide-react";
import { useCommentsByLesson } from "@/hooks/useComments";
import { format as formatDate } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  focusedStudentId?: string;
}

// Component to show lesson with comment hover
const LessonWithComments = ({
  lesson,
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
  onAddComment,
  isStudentView = false,
  onViewComments,
}: {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  onJoinLesson?: () => void;
  onUpdatePaymentStatus: (
    lessonId: string,
    status: Lesson["paymentStatus"],
  ) => void;
  onAddComment?: () => void;
  isStudentView?: boolean;
  onViewComments?: (lessonId: string) => void;
}) => {
  const { data: comments = [] } = useCommentsByLesson(lesson.id);
  const hasComments = comments.length > 0;

  const getPaymentStatusColor = (status: string) => {
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
  };

  const lessonContent = (
    <div
      className="p-2 sm:p-1.5 rounded text-xs sm:text-xs hover-elevate group border-l-2"
      style={{
        backgroundColor: `${lesson.studentColor}15`,
        borderLeftColor: lesson.studentColor || "#3b82f6",
      }}
      data-testid={`lesson-${lesson.id}`}
    >
      <div
        className="cursor-pointer"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <div className="flex items-center gap-1 sm:gap-1">
          <Clock className="h-3.5 w-3.5 sm:h-3 sm:w-3 flex-shrink-0" />
          <span className="truncate text-xs sm:text-xs font-medium">
            {format(lesson.dateTime, "HH:mm")}-
            {format(
              new Date(lesson.dateTime.getTime() + lesson.duration * 60000),
              "HH:mm",
            )}
          </span>
          {hasComments && (
            <div 
              className="flex items-center gap-0.5 ml-auto cursor-pointer hover:opacity-70 transition-opacity"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewComments?.(lesson.id);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span className="text-xs sm:text-[10px] font-medium">{comments.length}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="truncate font-semibold text-sm sm:text-xs leading-tight">{lesson.studentName}</div>
          <div className="truncate text-muted-foreground text-sm sm:text-xs leading-tight">{lesson.subject}</div>
        </div>

        <div className="flex items-center gap-1 mt-1">
          {!isStudentView && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/*<Button
                  variant="ghost"
                  size="sm"
                  className={`${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 px-2 py-0.5 h-auto text-[10px] sm:text-xs font-medium flex items-center gap-0.5`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                >
                  {lesson.paymentStatus}
                  <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>*/}
                <button
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 cursor-pointer mt-1`}
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`dropdown-payment-status-${lesson.id}`}
                >
                  {lesson.paymentStatus}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus?.(lesson.id, "pending")}
                  className={
                    lesson.paymentStatus === "pending" ? "bg-accent" : ""
                  }
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-pending mr-2"></span>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus?.(lesson.id, "paid")}
                  className={lesson.paymentStatus === "paid" ? "bg-accent" : ""}
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-confirmed mr-2"></span>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus?.(lesson.id, "unpaid")}
                  className={
                    lesson.paymentStatus === "unpaid" ? "bg-accent" : ""
                  }
                >
                  <span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>
                  Unpaid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdatePaymentStatus?.(lesson.id, "free")}
                  className={lesson.paymentStatus === "free" ? "bg-accent" : ""}
                >
                  <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                  Free
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        </div>

      <div className="flex items-center gap-1 mt-2">
        {lesson.lessonLink && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onJoinLesson?.(lesson.lessonLink!);
            }}
            className="h-7 flex-1 text-xs sm:text-xs px-2"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
            Join
          </Button>
        )}
        {!isStudentView && onAddComment && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              {/*if (hasComments) {
                setViewCommentsLessonId(lesson.id);
              } else*/} {
                onAddComment(lesson.id);
              }
            }}
            className="h-7 w-7 p-0"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
          </Button>
        )}
        {!isStudentView && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete(lesson.id);
            }}
            className="h-7 w-7 sm:w-7 p-0 text-destructive hover:text-destructive border-destructive/50"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  if (!hasComments) {
    return lessonContent;
  }

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <div>{lessonContent}</div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 bg-popover border-popover-border"
        style={{ zIndex: 99999 }}
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Comments ({comments.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-2 border-primary/20 pl-2"
              >
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{comment.title}</p>
                  {comment.visibleToStudent === 1 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Visible
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {comment.content}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDate(new Date(comment.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

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
      case "free":
        return "bg-gray-400 text-white";
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
              s:{lesson.paymentStatus}
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
              {/*<span className="w-3 h-3 rounded-full bg-lesson-cancelled mr-2"></span>*/}
              Unpaid
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePaymentStatus(lesson.id, "free");
              }}
              className={lesson.paymentStatus === "free" ? "bg-accent" : ""}
              data-testid={`payment-option-free-${lesson.id}`}
            >
              <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              Free
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/*<button
              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 cursor-pointer mt-1`}
              onClick={(e) => e.stopPropagation()}
              data-testid={`dropdown-payment-status-${lesson.id}`}
            >
              s:{lesson.paymentStatus}
            </button>*/}
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePaymentStatus(lesson.id, "free");
              }}
              className={lesson.paymentStatus === "free" ? "bg-accent" : ""}
              data-testid={`payment-option-free-${lesson.id}`}
            >
              <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
              Free
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
  onAddComment,
  focusedStudentId,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedMobileDate, setSelectedMobileDate] = useState<Date | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [lastTapDate, setLastTapDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<string | null>(null);
  const { data: viewCommentsData = [] } = useCommentsByLesson(viewCommentsLessonId || '');

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
      case "free":
        return "bg-gray-400 text-white";
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
    const token = localStorage.getItem('sessionId');
    const baseUrl = window.location.origin;
    const icsUrl = `${baseUrl}/api/calendar/ics`;

    // Create a temporary link to download the .ics file
    const link = document.createElement('a');
    link.href = icsUrl;
    link.setAttribute('download', 'lessons.ics');

    // Add authorization header via fetch and trigger download
    fetch(icsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error downloading calendar:', error);
    });
  };

  const viewedLesson = viewCommentsLessonId ? lessons.find(l => l.id === viewCommentsLessonId) : null;

  return (
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

            {/*<div className="flex rounded-md border">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                data-testid="button-month-view"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                data-testid="button-week-view"
                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
              >
                Week
              </Button>
            </div>*/}

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
            const isSelected = selectedMobileDate && isSameDay(day, selectedMobileDate);

            return (
              <div
                key={day.toISOString()}
                className={`
                  ${isMobile ? 'min-h-11 p-0.5' : 'min-h-16 sm:min-h-24 p-1 sm:p-2'} border rounded-sm cursor-pointer hover-elevate
                  ${isToday ? "bg-accent" : "bg-card"}
                  ${isSelected && isMobile ? "ring-2 ring-primary" : ""}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                `}
                onClick={() => isMobile ? handleMobileDateClick(day) : onDateClick(day)}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div
                  className={`${isMobile ? 'text-[9px]' : 'text-[10px] sm:text-sm'} font-medium mb-0.5 sm:mb-1 ${isToday ? "text-primary" : ""}`}
                >
                  {format(day, "d")}
                </div>

                {isMobile ? (
                  <div className="space-y-[2px]">
                    {dayLessons.slice(0, 2).map((lesson) => {
                      const isOtherStudent =
                        focusedStudentId && lesson.studentId !== focusedStudentId;

                      return (
                        <div
                          key={lesson.id}
                          className="h-1 rounded-full"
                          style={{
                            backgroundColor: isOtherStudent
                              ? '#9ca3af'
                              : (lesson.studentColor || '#3b82f6')
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
                      const isOtherStudent =
                        focusedStudentId && lesson.studentId !== focusedStudentId;

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
                          onDelete={() => onDeleteLesson?.(lesson)}
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
              {format(selectedMobileDate, 'EEEE, MMMM d')}
              {selectedMobileLessons.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({selectedMobileLessons.length} {selectedMobileLessons.length === 1 ? 'lesson' : 'lessons'})
                </span>
              )}
            </h3>
            {selectedMobileLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons scheduled</p>
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
                      onDelete={() => onDeleteLesson?.(lesson)}
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

      <Dialog open={!!viewCommentsLessonId} onOpenChange={() => setViewCommentsLessonId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {viewedLesson && viewCommentsData.length > 0 && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewCommentsData.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-primary/20 pl-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{comment.title}</p>
                      {comment.visibleToStudent === 1 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Visible
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {comment.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDate(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}