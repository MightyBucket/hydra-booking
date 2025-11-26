import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentForm from "@/components/CommentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Link as LinkIcon,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { PaymentStatus } from "@/lib/paymentStatus";
import {
  CommentWithTags,
  PaymentStatusDropdown,
  PaymentStatusBadge,
  Comment,
} from "@/components/shared/LessonComponents";

interface LessonCardProps {
  lesson: {
    id: string;
    subject: string;
    dateTime: Date;
    studentName: string;
    studentColor?: string;
    duration: number;
    paymentStatus: PaymentStatus;
    pricePerHour: number;
    lessonLink?: string;
  };
  comments?: Comment[];
  onEdit: (lessonId: string) => void;
  onDelete: (lessonId: string) => void;
  onJoinLesson?: (link: string) => void;
  onUpdatePaymentStatus?: (lessonId: string, status: PaymentStatus) => void;
  onAddComment?: (lessonId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] },
  ) => void;
  showCommentActions?: boolean;
  isStudentView?: boolean;
}

export default function LessonCard({
  lesson,
  comments = [],
  onEdit,
  onDelete,
  onJoinLesson,
  onUpdatePaymentStatus,
  onAddComment,
  onDeleteComment,
  onEditComment,
  showCommentActions = true,
  isStudentView = false,
}: LessonCardProps) {
  const [viewComments, setViewComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const totalPrice = (lesson.pricePerHour * lesson.duration) / 60;

  return (
    <Card
      className="hover-elevate border-l-4 border-l-primary/20"
      data-testid={`lesson-card-${lesson.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">
              {lesson.subject}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: lesson.studentColor || "#3b82f6" }}
              />
              <span className="truncate">{lesson.studentName}</span>
            </div>
          </div>
          {onUpdatePaymentStatus ? (
            <PaymentStatusDropdown
              lessonId={lesson.id}
              currentStatus={lesson.paymentStatus}
              onUpdateStatus={onUpdatePaymentStatus}
            />
          ) : (
            <PaymentStatusBadge status={lesson.paymentStatus} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">
                {format(lesson.dateTime, "h:mm a")}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {lesson.duration}min
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>£{lesson.pricePerHour}/hr</span>
            </div>
            <span className="font-semibold">£{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {lesson.lessonLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJoinLesson?.(lesson.lessonLink!)}
                data-testid={`button-join-lesson-${lesson.id}`}
                className="h-8 px-3 text-xs"
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                Join
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isStudentView && showCommentActions && onAddComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddComment(lesson.id);
                }}
                data-testid={`button-add-comment-${lesson.id}`}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
            )}
            {!isStudentView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(lesson.id)}
                data-testid={`button-edit-lesson-${lesson.id}`}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {!isStudentView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(lesson.id)}
                data-testid={`button-delete-lesson-${lesson.id}`}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Comments ({comments.length})
            </div>
            {comments.map((comment) => (
              <CommentWithTags
                key={comment.id}
                comment={comment}
                showActions={showCommentActions}
                onEdit={onEditComment ? (id, data) => {
                  setEditingCommentId(id);
                  onEditComment(id, data);
                } : undefined}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={viewComments} onOpenChange={setViewComments}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-2 border-primary/20 pl-3"
              >
                {editingCommentId === comment.id && onEditComment ? (
                  <CommentForm
                    initialData={{
                      title: comment.title,
                      content: comment.content,
                      visibleToStudent: comment.visibleToStudent === 1,
                      tagIds: [],
                    }}
                    isEditing={true}
                    onSubmit={async (data) => {
                      await onEditComment(comment.id, {
                        title: data.title,
                        content: data.content,
                        visibleToStudent: data.visibleToStudent ? 1 : 0,
                        tagIds: data.tagIds,
                      });
                      setEditingCommentId(null);
                    }}
                    onCancel={() => setEditingCommentId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">
                          {comment.title}
                        </h4>
                        <span title={comment.visibleToStudent === 1 ? "Visible to Student" : "Private"}>
                          {comment.visibleToStudent === 1 ? (
                            <Eye className="h-3 w-3 mr-1 text-muted-foreground" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1 text-muted-foreground" />
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                        {comment.lastEdited && (
                          <span className="ml-2 italic">
                            (edited {format(new Date(comment.lastEdited), "MMM d, h:mm a")})
                          </span>
                        )}
                      </p>
                    </div>
                    {showCommentActions && (
                      <div className="flex gap-1">
                        {onEditComment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const response = await fetch(`/api/comments/${comment.id}/tags`);
                              const commentTags = response.ok ? await response.json() : [];
                              onEditComment(comment.id, {
                                title: comment.title,
                                content: comment.content,
                                visibleToStudent: comment.visibleToStudent,
                                tagIds: commentTags.map((tag: any) => tag.id),
                              });
                              setViewComments(false);
                            }}
                            className="h-6 w-6 p-0"
                            data-testid={`button-edit-comment-${comment.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDeleteComment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onDeleteComment(comment.id);
                              if (comments.length === 1) {
                                setViewComments(false);
                              }
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            data-testid={`button-delete-comment-${comment.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
