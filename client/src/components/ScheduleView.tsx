
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import LessonCardWithComments from "@/components/LessonCardWithComments";
import LessonWithComments from "@/components/LessonWithComments";

interface Lesson {
  id: string;
  subject: string;
  dateTime: Date;
  studentName: string;
  studentColor?: string;
  studentId?: string;
  duration: number;
  paymentStatus: "pending" | "paid" | "unpaid" | "free" | "cancelled";
  pricePerHour: number;
  lessonLink?: string;
}

interface ScheduleViewProps {
  lessons: Lesson[];
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  onJoinLesson?: (lesson: Lesson) => void;
  onUpdatePaymentStatus?: (
    lessonId: string,
    status: "pending" | "paid" | "unpaid" | "free"
  ) => void;
  onAddComment?: (lessonId: string) => void;
  onViewComments?: (lessonId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number }
  ) => void;
  onDeleteComment?: (commentId: string) => void;
  isStudentView?: boolean;
  title?: string;
  showCommentActions?: boolean;
}

export default function ScheduleView({
  lessons,
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
  onAddComment,
  onViewComments,
  onEditComment,
  onDeleteComment,
  isStudentView = false,
  title = "Schedule",
  showCommentActions = true,
}: ScheduleViewProps) {
  const isMobile = useIsMobile();

  // Filter lessons starting from last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);

  const displayLessons = lessons
    .filter((lesson) => lesson.dateTime >= lastWeek)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // Group lessons by date
  const groupedLessons = displayLessons.reduce((groups: any, lesson: any) => {
    const dateKey = format(lesson.dateTime, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(lesson);
    return groups;
  }, {});

  // Ensure today's date is in the grouped lessons (even if empty)
  const todayKey = format(new Date(), "yyyy-MM-dd");
  if (!groupedLessons[todayKey]) {
    groupedLessons[todayKey] = [];
  }

  // Sort the dates to ensure proper chronological order
  const sortedDates = Object.keys(groupedLessons).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Auto-scroll to today's section on mount
  useEffect(() => {
    const todayElement = document.querySelector('[data-today-section="true"]');
    if (todayElement) {
      setTimeout(() => {
        todayElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} ({displayLessons.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.map((dateKey, index) => {
            const lessons = groupedLessons[dateKey];
            const date = new Date(dateKey);
            const isToday = todayKey === dateKey;
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            // Check if this is the first lesson of a new month
            const isFirstLessonOfMonth =
              index === 0 ||
              format(date, "yyyy-MM") !==
                format(new Date(sortedDates[index - 1]), "yyyy-MM");

            return (
              <div
                key={dateKey}
                className="space-y-3"
                data-date-key={dateKey}
                data-today-section={isToday ? "true" : undefined}
              >
                {isFirstLessonOfMonth && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {format(date, "MMMM yyyy")}
                    </h2>
                    <div className="h-px bg-border"></div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <h3
                    className={`text-lg font-semibold ${isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""}`}
                  >
                    {isToday ? "Today" : format(date, "EEE d")}
                  </h3>
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-sm text-muted-foreground">
                    {lessons.length} lesson
                    {lessons.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3 pl-4">
                  {lessons.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No lessons scheduled
                    </div>
                  ) : (
                    lessons.map((lesson) =>
                      isMobile ? (
                        <LessonWithComments
                          key={lesson.id}
                          lesson={lesson}
                          onEdit={onEdit ? () => onEdit(lesson) : () => {}}
                          onDelete={onDelete ? () => onDelete(lesson) : () => {}}
                          onJoinLesson={
                            onJoinLesson && lesson.lessonLink
                              ? () => onJoinLesson(lesson)
                              : undefined
                          }
                          onUpdatePaymentStatus={
                            !isStudentView && onUpdatePaymentStatus
                              ? onUpdatePaymentStatus
                              : undefined
                          }
                          onAddComment={
                            onAddComment ? () => onAddComment(lesson.id) : undefined
                          }
                          onViewComments={onViewComments}
                          onEditComment={onEditComment}
                          onDeleteComment={onDeleteComment}
                          isStudentView={isStudentView}
                        />
                      ) : (
                        <LessonCardWithComments
                          key={lesson.id}
                          lesson={lesson}
                          onEdit={onEdit || (() => {})}
                          onDelete={onDelete || (() => {})}
                          onJoinLesson={
                            onJoinLesson && lesson.lessonLink
                              ? () => onJoinLesson(lesson)
                              : undefined
                          }
                          onUpdatePaymentStatus={
                            !isStudentView && onUpdatePaymentStatus
                              ? onUpdatePaymentStatus
                              : undefined
                          }
                          onAddComment={
                            onAddComment ? () => onAddComment(lesson.id) : undefined
                          }
                          onDeleteComment={onDeleteComment}
                          onEditComment={onEditComment}
                          showCommentActions={showCommentActions}
                          isStudentView={isStudentView}
                        />
                      ),
                    )
                  )}
                </div>
              </div>
            );
          })}

          {displayLessons.length === 0 && sortedDates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No lessons scheduled from last week onwards.</p>
              {!isStudentView && (
                <p>Click "Schedule Lesson" in the sidebar to get started.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
