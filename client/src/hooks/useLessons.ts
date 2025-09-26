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

// Helper function to calculate recurring lesson dates
function calculateRecurringDates(startDate: Date, frequency: string, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  // Add the initial lesson date
  dates.push(new Date(current));
  
  // Calculate interval based on frequency
  const intervalDays = frequency === 'weekly' ? 7 : 14; // weekly or biweekly
  
  // Generate recurring dates until end date
  while (true) {
    // Create a new date by adding the interval in milliseconds
    const nextDate = new Date(current.getTime() + (intervalDays * 24 * 60 * 60 * 1000));
    
    if (nextDate > endDate) {
      break;
    }
    
    dates.push(new Date(nextDate));
    current.setTime(nextDate.getTime());
  }
  
  return dates;
}

// Hook for creating lesson with recurring capability
export function useCreateLessonWithRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      lesson: InsertLesson, 
      recurring?: { frequency: string, endDate?: string } 
    }) => {
      // If recurring, create all lesson instances
      if (data.recurring && data.recurring.endDate) {
        const startDate = new Date(data.lesson.dateTime);
        const endDate = new Date(data.recurring.endDate + 'T23:59:59.999Z');
        const recurringDates = calculateRecurringDates(startDate, data.recurring.frequency, endDate);
        
        const createdLessons: Lesson[] = [];
        let firstLesson: Lesson | null = null;
        
        // Create individual lesson for each date
        for (const date of recurringDates) {
          const lessonData = {
            ...data.lesson,
            dateTime: date.toISOString()
          };
          
          const lessonRes = await apiRequest('POST', '/api/lessons', lessonData);
          const createdLesson = await lessonRes.json() as Lesson;
          createdLessons.push(createdLesson);
          
          if (!firstLesson) {
            firstLesson = createdLesson;
          }
        }
        
        // Create the recurring lesson record using the first lesson as template
        if (firstLesson) {
          const recurringData: InsertRecurringLesson = {
            templateLessonId: firstLesson.id,
            frequency: data.recurring.frequency,
            endDate: endDate,
          };
          
          await apiRequest('POST', '/api/recurring-lessons', recurringData);
        }
        
        return firstLesson;
      } else {
        // Create single lesson
        const lessonRes = await apiRequest('POST', '/api/lessons', data.lesson);
        return await lessonRes.json() as Lesson;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recurring-lessons'] });
    },
  });
}