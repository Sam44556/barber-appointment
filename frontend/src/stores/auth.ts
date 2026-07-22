import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { apiService } from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await apiService.login(credentials);
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await apiService.register(userData);
          
          // Don't auto-login after registration, redirect to login
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        // Remove token from localStorage
        localStorage.removeItem('auth_token');
        
        // Clear auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Call logout API (optional, don't wait for response)
        apiService.logout().catch(() => {
          // Ignore errors on logout
        });
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }
        
        try {
          set({ isLoading: true });
          const response = await apiService.getSession();
          
          set({
            user: response.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If session check fails, clear auth
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
