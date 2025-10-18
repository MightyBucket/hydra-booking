import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "./useComments";
import { useDialogState } from "./useDialogState";

/**
 * Interface for comment form state
 * Tracks which lesson the comment belongs to and if we're editing an existing comment
 */
interface CommentFormData {
  lessonId: string;
  editingId?: string;
  commentData?: any;
}

/**
 * Hook for managing comment CRUD operations
 * Handles creating, updating, and deleting comments on lessons
 */
export function useCommentHandlers() {
  const { isOpen: showCommentForm, data: formData, open: openCommentForm, close: closeCommentForm } = useDialogState<CommentFormData>();
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<string | null>(null);

  const { toast } = useToast();
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  // Open comment form for a specific lesson
  const handleAddComment = (lessonId: string) => {
    openCommentForm({ lessonId });
  };

  const handleCommentSubmit = async (data: {
    title: string;
    content: string;
    visibleToStudent: boolean;
  }) => {
    if (!formData?.lessonId) return;

    try {
      await createCommentMutation.mutateAsync({
        lessonId: formData.lessonId,
        title: data.title,
        content: data.content,
        visibleToStudent: data.visibleToStudent ? 1 : 0,
      });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      resetCommentForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleStartEditComment = (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    openCommentForm({ lessonId: '', editingId: commentId, commentData: data });
  };

  const handleEditComment = async (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number },
  ) => {
    try {
      await updateCommentMutation.mutateAsync({ id: commentId, ...data });
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      resetCommentForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const resetCommentForm = () => {
    closeCommentForm();
  };

  return {
    showCommentForm,
    setShowCommentForm: (open: boolean) => open ? openCommentForm({ lessonId: '' }) : closeCommentForm(),
    viewCommentsLessonId,
    setViewCommentsLessonId,
    editingCommentId: formData?.editingId || null,
    editingCommentData: formData?.commentData || null,
    handleAddComment,
    handleCommentSubmit,
    handleStartEditComment,
    handleEditComment,
    handleDeleteComment,
    resetCommentForm,
  };
}