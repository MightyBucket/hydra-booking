
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Clock, ExternalLink, Trash2, MessageSquare } from 'lucide-react';
import { useCommentsByLesson } from '@/hooks/useComments';
import { format as formatDate } from 'date-fns';

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

interface LessonWithCommentsProps {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  onJoinLesson?: () => void;
  onUpdatePaymentStatus: (lessonId: string, status: Lesson["paymentStatus"]) => void;
  onAddComment?: () => void;
  isStudentView?: boolean;
  onViewComments?: (lessonId: string) => void;
}

// Helper function to detect and linkify URLs
const linkifyText = (text: string): JSX.Element => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) => {
        // Check if the part matches a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

export default function LessonWithComments({
  lesson,
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
  onAddComment,
  isStudentView = false,
  onViewComments,
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
            Join
          </Button>
        )}
        {!isStudentView && onAddComment && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
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
                  {linkifyText(comment.content)}
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
}
