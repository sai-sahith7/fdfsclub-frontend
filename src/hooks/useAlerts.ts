import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getAlerts, createAlert, cancelAlert, restoreAlert, getHistoryAlerts } from '@/api/alerts'
import type { Alert, CreateAlertFormData } from '@/types'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useHistoryAlerts(page: number, limit = 10) {
  return useQuery({
    queryKey: ['historyAlerts', page, limit],
    queryFn: () => getHistoryAlerts(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useCreateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAlertFormData) => createAlert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useCancelAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelAlert(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['alerts'] })
      const previous = qc.getQueryData<Alert[]>(['alerts'])
      qc.setQueryData<Alert[]>(['alerts'], (alerts) => alerts?.filter((alert) => alert._id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(['alerts'], context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['historyAlerts'] })
    },
  })
}

export function useRestoreAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreAlert(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['historyAlerts'] })
    },
  })
}
