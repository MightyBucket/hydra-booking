
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useCommentsByLesson } from "@/hooks/useComments";
import { useStudentLessonComments } from "@/hooks/useStudentData";
import { format } from "date-fns";

// Helper function to detect and linkify URLs
const linkifyText = (text: string): JSX.Element => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) => {
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

interface ScheduleCommentsDialogProps {
  lessonId: string | null;
  onClose: () => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (
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
    !isStudentView && lessonId ? lessonId : ""
  );

  const { data: studentComments = [] } = useStudentLessonComments(
    studentId || "",
    lessonId || ""
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
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-2 border-primary/20 pl-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">{comment.title}</p>
                        {!isStudentView && comment.visibleToStudent === 1 ? (
                          <Eye
                            className="h-3 w-3 text-muted-foreground"
                            title="Visible to student"
                          />
                        ) : !isStudentView ? (
                          <EyeOff
                            className="h-3 w-3 text-muted-foreground"
                            title="Not visible to student"
                          />
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                        {linkifyText(comment.content)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        {comment.lastEdited && (
                          <span className="ml-2 italic">
                            (edited{" "}
                            {format(
                              new Date(comment.lastEdited),
                              "MMM d, h:mm a"
                            )}
                            )
                          </span>
                        )}
                      </p>
                    </div>
                    {!isStudentView && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
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
                          onClick={() => onDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
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
