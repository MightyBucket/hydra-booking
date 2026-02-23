import { useQuery } from '@tanstack/react-query';

// Hook to get a parent by their 6-digit parentId (public endpoint)
export function useParentByParentId(parentId: string | undefined) {
  return useQuery({
    queryKey: ['/api/parent', parentId],
    queryFn: async () => {
      if (!parentId) return null;
      const res = await fetch(`/api/parent/${parentId}`);
      if (!res.ok) {
        throw new Error('Parent not found');
      }
      return await res.json();
    },
    enabled: !!parentId,
  });
}

// Hook to get lessons for all of a parent's students (public endpoint)
export function useParentLessonsByParentId(parentId: string | undefined) {
  return useQuery({
    queryKey: [`/api/parent/${parentId}/lessons`],
    queryFn: async () => {
      if (!parentId) return { lessons: [], blockedSlots: [] };
      const res = await fetch(`/api/parent/${parentId}/lessons`);
      if (!res.ok) {
        throw new Error('Failed to fetch parent lessons');
      }
      return await res.json();
    },
    enabled: !!parentId,
  });
}

// Hook to get comments for a lesson (parent view)
export function useParentLessonComments(parentId: string | undefined, lessonId: string | undefined) {
  return useQuery({
    queryKey: ['/api/parent', parentId, 'lessons', lessonId, 'comments'],
    queryFn: async () => {
      if (!parentId || !lessonId) return [];
      const res = await fetch(`/api/parent/${parentId}/lessons/${lessonId}/comments`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('Failed to fetch comments');
      }
      return await res.json();
    },
    enabled: !!parentId && !!lessonId,
  });
}
