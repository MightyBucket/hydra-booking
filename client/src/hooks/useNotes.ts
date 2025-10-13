
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Note {
  id: string;
  studentId: string;
  title: string;
  content: string;
  createdAt: string;
}

export function useNotesByStudent(studentId: string) {
  return useQuery<Note[]>({
    queryKey: ["notes", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}/notes`, {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      return response.json();
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; title: string; content: string }) => {
      const response = await fetch(`/api/students/${data.studentId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
        body: JSON.stringify({
          studentId: data.studentId,
          title: data.title,
          content: data.content,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", variables.studentId] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; studentId: string; title: string; content: string }) => {
      const response = await fetch(`/api/notes/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", variables.studentId] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; studentId: string }) => {
      const response = await fetch(`/api/notes/${data.id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", variables.studentId] });
    },
  });
}
