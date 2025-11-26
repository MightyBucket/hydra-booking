import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  MessageSquare,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useCommentsByLesson } from "@/hooks/useComments";
import { format as formatDate } from "date-fns";
import { getPaymentStatusColor, PaymentStatus } from "@/lib/paymentStatus";
import {
  CommentWithTags,
  PaymentStatusDropdown,
  Comment,
} from "@/components/shared/LessonComponents";

interface Lesson {
  id: string;
  subject: string;
  dateTime: Date;
  studentName: string;
  studentColor?: string;
  studentId?: string;
  duration: number;
  paymentStatus: PaymentStatus;
  pricePerHour: number;
  lessonLink?: string;
}

interface LessonWithCommentsProps {
  lesson: Lesson;
  onEdit: () => void;
  onDelete?: () => void;
  onJoinLesson?: () => void;
  onUpdatePaymentStatus?: (
    lessonId: string,
    status: Lesson["paymentStatus"],
  ) => void;
  onAddComment?: () => void;
  isStudentView?: boolean;
  onViewComments?: (lessonId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] },
  ) => void;
  onDeleteComment?: (commentId: string) => void;
}

export default function LessonWithComments({
  lesson,
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
  onAddComment,
  isStudentView = false,
  onViewComments,
  onEditComment,
  onDeleteComment,
}: LessonWithCommentsProps) {
  const { data: comments = [] } = useCommentsByLesson(lesson.id);
  const hasComments = comments.length > 0;

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
            {formatDate(lesson.dateTime, "HH:mm")}-
            {formatDate(
              new Date(lesson.dateTime.getTime() + lesson.duration * 60000),
              "HH:mm",
            )}
          </span>
          {hasComments && (
            <div
              className="flex items-center gap-0.5 ml-auto cursor-pointer hover:opacity-70 transition-opacity bg-primary/10 rounded px-1"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onViewComments?.(lesson.id);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-primary" />
              <span className="text-xs sm:text-[10px] font-medium text-primary">
                {comments.length}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="truncate font-semibold text-sm sm:text-xs leading-tight">
            {lesson.studentName}
          </div>
          <div className="truncate text-muted-foreground text-sm sm:text-xs leading-tight">
            {lesson.subject}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        {lesson.lessonLink && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onJoinLesson?.();
            }}
            className="h-7 flex-1 text-xs sm:text-xs px-2"
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
          </Button>
        )}
        {!isStudentView && onAddComment && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onAddComment();
            }}
            className="h-7 w-7 p-0"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
          </Button>
        )}
        {!isStudentView && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 w-7 sm:w-7 p-0 text-destructive hover:text-destructive border-destructive/50"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
          </Button>
        )}
        {onUpdatePaymentStatus && !isStudentView ? (
          <PaymentStatusDropdown
            lessonId={lesson.id}
            currentStatus={lesson.paymentStatus}
            onUpdateStatus={onUpdatePaymentStatus}
            variant="compact"
          />
        ) : isStudentView ? (
          <div
            className={`${getPaymentStatusColor(lesson.paymentStatus)} px-2 py-0.5 h-7 text-xs font-medium rounded inline-flex items-center`}
          >
            &nbsp;&nbsp;&nbsp;
          </div>
        ) : null}
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
          <h4 className="text-sm font-semibold">
            Comments ({comments.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment: Comment) => (
              <CommentWithTags
                key={comment.id}
                comment={comment}
                compact={true}
                showActions={!isStudentView && !!onEditComment && !!onDeleteComment}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
