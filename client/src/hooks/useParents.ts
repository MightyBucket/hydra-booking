
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Parent, InsertParent } from '@shared/schema';

export function useParents() {
  return useQuery({
    queryKey: ['/api/parents'],
  });
}

export function useParent(id: string | undefined) {
  return useQuery({
    queryKey: ['/api/parents', id],
    enabled: !!id,
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (parent: InsertParent) => {
      const res = await apiRequest('POST', '/api/parents', parent);
      return await res.json() as Parent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertParent>) => {
      const res = await apiRequest('PUT', `/api/parents/${id}`, data);
      return await res.json() as Parent;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents', variables.id] });
    },
  });
}

export function useDeleteParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/parents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });
}
