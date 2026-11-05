import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProfile } from '@/api/user'
import { hasValidToken } from '@/store/session'
import type { User } from '@/types'

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  setAuth: (user: User) => void
  clearAuth: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      setAuth: (user) => set({ isLoggedIn: true, user }),
      clearAuth: () => set({ isLoggedIn: false, user: null }),
      refreshUser: async () => {
        const user = await getProfile().catch(() => null)
        if (user) set({ user })
      },
    }),
    {
      name: 'fdfsclub-auth',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<AuthState>) }
        return state.isLoggedIn && !hasValidToken() ? { ...state, isLoggedIn: false, user: null } : state
      },
    }
  )
)
