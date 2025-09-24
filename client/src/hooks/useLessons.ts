import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Lesson, InsertLesson, Student } from '@shared/schema';

// Extended lesson type for display purposes
export interface LessonWithStudent extends Lesson {
  student: Student;
}

export function useLessons() {
  return useQuery({
    queryKey: ['/api/lessons'],
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: ['/api/lessons', id],
    enabled: !!id,
  });
}

export function useStudentLessons(studentId: string | undefined) {
  return useQuery({
    queryKey: ['/api/students', studentId, 'lessons'],
    enabled: !!studentId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lesson: InsertLesson) => {
      const res = await apiRequest('POST', '/api/lessons', lesson);
      return await res.json() as Lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertLesson>) => {
      const res = await apiRequest('PUT', `/api/lessons/${id}`, data);
      return await res.json() as Lesson;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lessons', variables.id] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
    },
  });
}