
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const AUTH_STORAGE_KEY = 'auth_session_id';

export function getStoredSessionId(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setStoredSessionId(sessionId: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, sessionId);
}

export function clearStoredSessionId(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function useAuth() {
  return useQuery({
    queryKey: ['/api/auth/validate'],
    queryFn: async () => {
      const sessionId = getStoredSessionId();
      if (!sessionId) {
        return { authenticated: false };
      }

      try {
        const res = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (!res.ok) {
          clearStoredSessionId();
          return { authenticated: false };
        }

        return await res.json();
      } catch (error) {
        clearStoredSessionId();
        return { authenticated: false };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      setStoredSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/validate'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const sessionId = getStoredSessionId();
      if (sessionId) {
        await apiRequest('POST', '/api/auth/logout', undefined);
      }
      clearStoredSessionId();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/validate'] });
    },
  });
}
