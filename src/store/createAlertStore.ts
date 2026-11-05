import { create } from 'zustand'
import type { CreateAlertFormData } from '@/types'

interface CreateAlertState {
  step: number
  formData: Partial<CreateAlertFormData>
  nudge: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateForm: (patch: Partial<CreateAlertFormData>) => void
  resetForm: () => void
  nudgeMissing: () => void
}

const TOTAL_STEPS = 4

const defaultForm: Partial<CreateAlertFormData> = {
  city: '',
  movie_name: '',
  date: '',
  theatre_ids: [],
  theatre_names: [],
  formats: [],
  languages: [],

  show_time_min: 0,
  show_time_max: 1439,
  price_min: 0,
  price_max: 2000,
}

export const useCreateAlertStore = create<CreateAlertState>((set) => ({
  step: 0,
  formData: { ...defaultForm },
  nudge: 0,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS - 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  updateForm: (patch) => set((s) => ({ formData: { ...s.formData, ...patch } })),
  resetForm: () => set({ step: 0, formData: { ...defaultForm } }),
  nudgeMissing: () => set((s) => ({ nudge: s.nudge + 1 })),
}))