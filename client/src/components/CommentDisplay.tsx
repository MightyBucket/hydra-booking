
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { linkifyText } from "@/lib/linkify";

interface Comment {
  id: string;
  title: string;
  content: string;
  visibleToStudent: number;
  createdAt: string;
  lastEdited?: string;
}

interface CommentDisplayProps {
  comment: Comment;
  showActions?: boolean;
  showVisibilityIcon?: boolean;
  onEdit?: (commentId: string, data: { title: string; content: string; visibleToStudent: number }) => void;
  onDelete?: (commentId: string) => void;
}

export default function CommentDisplay({
  comment,
  showActions = true,
  showVisibilityIcon = true,
  onEdit,
  onDelete,
}: CommentDisplayProps) {
  return (
    <div className="border-l-2 border-primary/20 pl-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium">{comment.title}</p>
            {showVisibilityIcon && (
              comment.visibleToStudent === 1 ? (
                <Eye
                  className="h-3 w-3 text-muted-foreground"
                  title="Visible to student"
                />
              ) : (
                <EyeOff
                  className="h-3 w-3 text-muted-foreground"
                  title="Not visible to student"
                />
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
            {linkifyText(comment.content)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {format(new Date(comment.createdAt), "MMM d, h:mm a")}
            {comment.lastEdited && (
              <span className="ml-2 italic">
                (edited {format(new Date(comment.lastEdited), "MMM d, h:mm a")})
              </span>
            )}
          </p>
        </div>
        {showActions && onEdit && onDelete && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(comment.id, {
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
                onDelete(comment.id);
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
