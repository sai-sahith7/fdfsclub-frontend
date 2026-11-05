import { create } from 'zustand'

export type AuthReason = 'start' | 'return' | 'expired'

interface AuthModalState {
  isOpen: boolean
  reason: AuthReason
  open: (reason?: AuthReason) => void
  close: () => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  reason: 'start',
  open: (reason = 'start') => set({ isOpen: true, reason }),
  close: () => set({ isOpen: false }),
}))
