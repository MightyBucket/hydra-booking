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
    tagIds?: string[];
  }) => {
    if (!formData?.lessonId) return;

    try {
      const commentData = {
        title: data.title,
        content: data.content,
        visibleToStudent: data.visibleToStudent ? 1 : 0,
        tagIds: data.tagIds, // Include tagIds
      };

      const response = await fetch(`/api/lessons/${formData.lessonId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // The createCommentMutation is not used here, so we'll keep the toast and reset form logic
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
    data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] }, // Added tagIds to edit data
  ) => {
    openCommentForm({ lessonId: '', editingId: commentId, commentData: data });
  };

  const handleEditComment = async (
    commentId: string,
    data: { title: string; content: string; visibleToStudent: number; tagIds?: string[] }, // Added tagIds to edit data
  ) => {
    try {
      // Assuming updateCommentMutation can handle tagIds
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