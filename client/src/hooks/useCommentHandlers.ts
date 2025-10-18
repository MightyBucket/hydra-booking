
import { useState } from 'react';
import { useCreateComment, useUpdateComment, useDeleteComment } from './useComments';
import { useToast } from './use-toast';

export function useCommentHandlers() {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentFormLessonId, setCommentFormLessonId] = useState<string | null>(null);
  const [viewCommentsLessonId, setViewCommentsLessonId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentData, setEditingCommentData] = useState<{
    title: string;
    content: string;
    visibleToStudent: number;
  } | null>(null);

  const { toast } = useToast();
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleAddComment = (lessonId: string) => {
    setCommentFormLessonId(lessonId);
    setShowCommentForm(true);
  };

  const handleCommentSubmit = async (data: {
    title: string;
    content: string;
    visibleToStudent: boolean;
  }) => {
    if (!commentFormLessonId) return;

    try {
      await createCommentMutation.mutateAsync({
        lessonId: commentFormLessonId,
        title: data.title,
        content: data.content,
        visibleToStudent: data.visibleToStudent ? 1 : 0,
      });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setShowCommentForm(false);
      setCommentFormLessonId(null);
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
    setEditingCommentId(commentId);
    setEditingCommentData(data);
    setViewCommentsLessonId(null);
    setShowCommentForm(true);
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
      setEditingCommentId(null);
      setEditingCommentData(null);
      setShowCommentForm(false);
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
    setShowCommentForm(false);
    setCommentFormLessonId(null);
    setEditingCommentId(null);
    setEditingCommentData(null);
  };

  return {
    showCommentForm,
    setShowCommentForm,
    commentFormLessonId,
    viewCommentsLessonId,
    setViewCommentsLessonId,
    editingCommentId,
    editingCommentData,
    handleAddComment,
    handleCommentSubmit,
    handleStartEditComment,
    handleEditComment,
    handleDeleteComment,
    resetCommentForm,
  };
}
