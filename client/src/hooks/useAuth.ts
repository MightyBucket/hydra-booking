import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNavigate } from 'react-router-dom';

const AUTH_STORAGE_KEY = 'sessionId';

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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      // Store session ID in localStorage
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/validate'] });
      navigate('/');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear session ID from localStorage
      localStorage.removeItem('sessionId');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/validate'] });
      navigate('/login');
    },
  });
}