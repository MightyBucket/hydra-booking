import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Clock,
  Trash2,
  ChevronDown,
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCommentsByLesson } from "@/hooks/useComments";
import { useCommentTags } from "@/hooks/useTags";
import { format as formatDate } from "date-fns";
import { getPaymentStatusColor, PaymentStatus } from "@/lib/paymentStatus";
import { linkifyText } from "@/lib/linkify";

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
  onDelete: () => void;
  onJoinLesson?: () => void;
  onUpdatePaymentStatus: (
    lessonId: string,
    status: Lesson["paymentStatus"],
  ) => void;
  onAddComment?: () => void;
  isStudentView?: boolean;
  onViewComments?: (lessonId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
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

  // Component to display a single comment with its tags
  function CommentWithTags({ comment }: { comment: any }) {
    const { data: tags = [] } = useCommentTags(comment.id);

    return (
      <div className="border-l-2 border-primary/20 pl-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-medium">{comment.title}</p>
              {tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {comment.visibleToStudent === 1 ? (
                <Eye
                  className="h-3 w-3 text-muted-foreground"
                  title="Visible to student"
                />
              ) : (
                <EyeOff
                  className="h-3 w-3 text-muted-foreground"
                  title="Not visible to student"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {linkifyText(comment.content)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatDate(new Date(comment.createdAt), "MMM d, h:mm a")}
              {comment.lastEdited && (
                <span className="ml-2 italic">
                  (edited{" "}
                  {formatDate(
                    new Date(comment.lastEdited),
                    "MMM d, h:mm a",
                  )}
                  )
                </span>
              )}
            </p>
          </div>
          {!isStudentView && onEditComment && onDeleteComment && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditComment(comment.id, {
                    title: comment.title,
                    content: comment.content,
                    visibleToStudent: comment.visibleToStudent,
                  });
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComment(comment.id);
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        {!isStudentView && (
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
        {!isStudentView && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 px-2 py-0.5 h-7 text-xs font-medium border-0`}
                  onClick={(e) => e.stopPropagation()}
                >
                  &nbsp;&nbsp;&nbsp;
                </Button>
              }

              {/*<button
                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPaymentStatusColor(lesson.paymentStatus)} hover:opacity-80 cursor-pointer mt-1`}
                onClick={(e) => e.stopPropagation()}
                data-testid={`dropdown-payment-status-${lesson.id}`}
              >
                &nbsp;
              </button>*/}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-24">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePaymentStatus(lesson.id, "pending");
                }}
                className={
                  lesson.paymentStatus === "pending" ? "bg-accent" : ""
                }
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
              >
                <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                Free
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePaymentStatus(lesson.id, "cancelled");
                }}
                className={lesson.paymentStatus === "cancelled" ? "bg-accent" : ""}
              >
                <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <h4 className="text-sm font-semibold">
            Comments ({comments.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <CommentWithTags key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
