import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login({ email, password });
          localStorage.setItem('ks_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
          return { success: true, isFirstLogin: res.user.isFirstLogin };
        } catch {
          set({ isLoading: false });
          return { success: false };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          localStorage.setItem('ks_token', res.token);
          set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
          toast.success('Workspace created! Welcome to KaryaSetu');
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false };
        }
      },

      logout: () => {
        localStorage.removeItem('ks_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),

      refreshUser: async () => {
        try {
          const res = await authAPI.getMe();
          set({ user: res.user });
        } catch {
          get().logout();
        }
      },

      hasRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      canUpload: () => {
        const { user } = get();
        return user ? ['super_admin','company_admin','project_manager'].includes(user.role) : false;
      },
    }),
    {
      name: 'ks-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
