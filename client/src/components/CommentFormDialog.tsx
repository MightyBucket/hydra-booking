
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommentForm from "./CommentForm";

interface CommentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCommentData?: {
    title: string;
    content: string;
    visibleToStudent: number;
    tagIds?: string[];
  } | null;
  isEditing: boolean;
  onSubmit: (data: { title: string; content: string; visibleToStudent: boolean; tagIds: string[] }) => void;
  onCancel: () => void;
}

export default function CommentFormDialog({
  open,
  onOpenChange,
  editingCommentData,
  isEditing,
  onSubmit,
  onCancel,
}: CommentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Comment" : "Add Comment"}
          </DialogTitle>
        </DialogHeader>
        <CommentForm
          initialData={
            editingCommentData
              ? {
                  title: editingCommentData.title,
                  content: editingCommentData.content,
                  visibleToStudent: editingCommentData.visibleToStudent === 1,
                  tagIds: editingCommentData.tagIds || [],
                }
              : undefined
          }
          isEditing={isEditing}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
