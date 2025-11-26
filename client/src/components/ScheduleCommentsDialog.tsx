
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCommentsByLesson } from "@/hooks/useComments";
import { useStudentLessonComments } from "@/hooks/useStudentData";
import CommentDisplay from "./CommentDisplay";

interface ScheduleCommentsDialogProps {
  lessonId: string | null;
  onClose: () => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number }
  ) => void;
  isStudentView?: boolean;
  studentId?: string;
}

export default function ScheduleCommentsDialog({
  lessonId,
  onClose,
  onDeleteComment,
  onEditComment,
  isStudentView = false,
  studentId,
}: ScheduleCommentsDialogProps) {
  const { data: regularComments = [] } = useCommentsByLesson(
    !isStudentView && lessonId ? lessonId : null
  );

  const { data: studentComments = [] } = useStudentLessonComments(
    studentId,
    lessonId || undefined
  );

  const comments = isStudentView ? studentComments : regularComments;

  return (
    <Dialog open={!!lessonId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        {comments.length > 0 ? (
          <div className="grid gap-4 py-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.map((comment: any) => (
                <CommentDisplay
                  key={comment.id}
                  comment={comment}
                  showActions={!isStudentView}
                  showVisibilityIcon={!isStudentView}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No comments available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
