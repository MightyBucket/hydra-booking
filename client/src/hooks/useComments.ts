
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Comment {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  visibleToStudent: number;
  createdAt: string;
}

export function useCommentsByLesson(lessonId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", lessonId],
    queryFn: async () => {
      const response = await fetch(`/api/lessons/${lessonId}/comments`, {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return response.json();
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { lessonId: string; title: string; content: string; visibleToStudent: number }) => {
      const response = await fetch(`/api/lessons/${data.lessonId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
        body: JSON.stringify({
          lessonId: data.lessonId,
          title: data.title,
          content: data.content,
          visibleToStudent: data.visibleToStudent,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.lessonId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
