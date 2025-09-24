import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Student, InsertStudent } from '@shared/schema';

export function useStudents() {
  return useQuery({
    queryKey: ['/api/students'],
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['/api/students', id],
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (student: InsertStudent) => {
      const res = await apiRequest('POST', '/api/students', student);
      return await res.json() as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertStudent>) => {
      const res = await apiRequest('PUT', `/api/students/${id}`, data);
      return await res.json() as Student;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students', variables.id] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });
}