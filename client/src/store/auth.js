import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) =>
        set({ user: userData, isAuthenticated: true }),

      logout: () =>
        set({ user: null, isAuthenticated: false }),

      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      changeAvatar: (avatar) =>
        set((state) => ({
          user: { ...state.user, avatar },
        })),

      updateProfile: (data) =>
        set((state) => ({
          user: { ...state.user, ...data }
        }))
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;