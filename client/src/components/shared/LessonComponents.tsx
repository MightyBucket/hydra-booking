import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useCommentTags } from "@/hooks/useTags";
import { getPaymentStatusColor, PaymentStatus } from "@/lib/paymentStatus";
import { linkifyText } from "@/lib/linkify";

export interface Comment {
  id: string;
  title: string;
  content: string;
  visibleToStudent: number;
  createdAt: string;
  lastEdited?: string;
}

export const PAYMENT_STATUS_OPTIONS: Array<{
  status: PaymentStatus;
  label: string;
  color: string;
}> = [
  { status: "pending", label: "Pending", color: "bg-lesson-pending" },
  { status: "paid", label: "Paid", color: "bg-lesson-confirmed" },
  { status: "overdue", label: "Overdue", color: "bg-lesson-cancelled" },
  { status: "unpaid", label: "Unpaid", color: "bg-lesson-cancelled" },
  { status: "free", label: "Free", color: "bg-blue-400" },
  { status: "cancelled", label: "Cancelled", color: "bg-gray-400" },
];

interface CommentWithTagsProps {
  comment: Comment;
  showActions?: boolean;
  onEdit?: (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] }
  ) => void;
  onDelete?: (commentId: string) => void;
  compact?: boolean;
}

export function CommentWithTags({
  comment,
  showActions = false,
  onEdit,
  onDelete,
  compact = false,
}: CommentWithTagsProps) {
  const { data: tags = [] } = useCommentTags(comment.id);

  if (compact) {
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
              <span title={comment.visibleToStudent === 1 ? "Visible to student" : "Not visible to student"}>
                {comment.visibleToStudent === 1 ? (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
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
                    tagIds: tags.map((tag: any) => tag.id),
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

  return (
    <div className="text-xs bg-muted/50 p-2 rounded space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium flex items-center gap-1 flex-wrap">
            {comment.title}
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
            <span title={comment.visibleToStudent === 1 ? "Visible to student" : "Not visible to student"}>
              {comment.visibleToStudent === 1 ? (
                <Eye className="h-3 w-3 text-muted-foreground" />
              ) : (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
            </span>
          </div>
          <div className="text-muted-foreground">{comment.content}</div>
          <div className="text-[10px] text-muted-foreground">
            {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
            {comment.lastEdited && (
              <span className="ml-2 italic">
                (edited {format(new Date(comment.lastEdited), "MMM d, h:mm a")})
              </span>
            )}
          </div>
        </div>
        {showActions && onEdit && onDelete && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onEdit(comment.id, {
                  title: comment.title,
                  content: comment.content,
                  visibleToStudent: comment.visibleToStudent,
                  tagIds: tags.map((tag: any) => tag.id),
                });
              }}
              className="h-5 w-5 p-0"
              data-testid={`button-edit-comment-${comment.id}`}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.id)}
              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
              data-testid={`button-delete-comment-${comment.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PaymentStatusDropdownProps {
  lessonId: string;
  currentStatus: PaymentStatus;
  onUpdateStatus: (lessonId: string, status: PaymentStatus) => void;
  variant?: "full" | "compact";
}

export function PaymentStatusDropdown({
  lessonId,
  currentStatus,
  onUpdateStatus,
  variant = "full",
}: PaymentStatusDropdownProps) {
  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${getPaymentStatusColor(currentStatus)} hover:opacity-80 px-2 py-0.5 h-7 text-xs font-medium border-0`}
            onClick={(e) => e.stopPropagation()}
          >
            &nbsp;&nbsp;&nbsp;
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-24">
          {PAYMENT_STATUS_OPTIONS.filter(opt => opt.status !== "overdue").map(({ status, label, color }) => (
            <DropdownMenuItem
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(lessonId, status);
              }}
              className={currentStatus === status ? "bg-accent" : ""}
            >
              <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${getPaymentStatusColor(currentStatus)} hover:opacity-80 px-2 py-1 h-auto text-xs font-medium flex-shrink-0`}
          data-testid={`dropdown-payment-status-${lessonId}`}
        >
          {currentStatus}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PAYMENT_STATUS_OPTIONS.map(({ status, label, color }) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onUpdateStatus(lessonId, status)}
            className={currentStatus === status ? "bg-accent" : ""}
            data-testid={`payment-option-${status}-${lessonId}`}
          >
            <span className={`w-3 h-3 rounded-full ${color} mr-2`}></span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge className={`${getPaymentStatusColor(status)} text-xs flex-shrink-0`}>
      {status}
    </Badge>
  );
}
