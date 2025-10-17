
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Hook to get a single student by their 6-digit studentId (public endpoint)
export function useStudentByStudentId(studentId: string | undefined) {
  return useQuery({
    queryKey: ['/api/student', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetch(`/api/student/${studentId}`);
      if (!res.ok) {
        throw new Error('Student not found');
      }
      return await res.json();
    },
    enabled: !!studentId,
  });
}

// Hook to get lessons for a specific student by their 6-digit studentId (public endpoint)
export function useStudentLessonsByStudentId(studentId: string | undefined) {
  return useQuery({
    queryKey: ['/api/student', studentId, 'lessons'],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await fetch(`/api/student/${studentId}/lessons`);
      if (!res.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return await res.json();
    },
    enabled: !!studentId,
  });
}

// Hook to get comments for a lesson belonging to a specific student (public endpoint)
export function useStudentLessonComments(studentId: string | undefined, lessonId: string | undefined) {
  return useQuery({
    queryKey: ['/api/student', studentId, 'lessons', lessonId, 'comments'],
    queryFn: async () => {
      if (!studentId || !lessonId) return [];
      const res = await fetch(`/api/student/${studentId}/lessons/${lessonId}/comments`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('Failed to fetch comments');
      }
      return await res.json();
    },
    enabled: !!studentId && !!lessonId,
  });
}
