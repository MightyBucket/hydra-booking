import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Lesson, InsertLesson, Student, RecurringLesson, InsertRecurringLesson } from '@shared/schema';

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

// Recurring lesson hooks
export function useRecurringLessons() {
  return useQuery({
    queryKey: ['/api/recurring-lessons'],
  });
}

export function useCreateRecurringLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recurringLesson: InsertRecurringLesson) => {
      const res = await apiRequest('POST', '/api/recurring-lessons', recurringLesson);
      return await res.json() as RecurringLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-lessons'] });
    },
  });
}

// Hook for creating lesson with recurring capability
export function useCreateLessonWithRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      lesson: InsertLesson, 
      recurring?: { frequency: string, endDate?: string } 
    }) => {
      // First create the lesson
      const lessonRes = await apiRequest('POST', '/api/lessons', data.lesson);
      const createdLesson = await lessonRes.json() as Lesson;
      
      // If recurring, create the recurring lesson record
      if (data.recurring) {
        const recurringData: InsertRecurringLesson = {
          templateLessonId: createdLesson.id,
          frequency: data.recurring.frequency,
          endDate: data.recurring.endDate ? new Date(data.recurring.endDate + 'T23:59:59.999Z') : null,
        };
        
        await apiRequest('POST', '/api/recurring-lessons', recurringData);
      }
      
      return createdLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-lessons'] });
    },
  });
}