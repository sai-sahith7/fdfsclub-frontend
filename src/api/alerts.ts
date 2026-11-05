import { apiClient } from './client'
import type { Alert, CreateAlertFormData, PaginatedResponse } from '@/types'

export const HISTORY_STATUSES = ['ALERTED', 'CANCELLED', 'EXPIRED'] as const

export const SHOW_TIME_RANGE = { min: 0, max: 1439 } as const
export const PRICE_RANGE = { min: 0, max: 2000 } as const

export async function getAlerts(): Promise<Alert[]> {
  const res = await apiClient.get<{ data: Alert[] }>('/api/alerts', { params: { status: 'ACTIVE' } })
  return res.data.data
}

export async function getHistoryAlerts(page = 1, limit = 10): Promise<PaginatedResponse<Alert>> {
  const res = await apiClient.get<{ data: PaginatedResponse<Alert> }>('/api/alerts', {
    params: { status: HISTORY_STATUSES.join(','), page, limit },
  })
  return res.data.data
}

function narrowedBound(value: number | undefined, edge: number): number | null {
  return value == null || value === edge ? null : value
}

export function buildAlertPayload(payload: CreateAlertFormData) {
  return {
    movie: {
      id: payload.movie_id,
      name: payload.movie_name,
      image_url: payload.movie_poster,
    },
    city: {
      name: payload.city_name || payload.city,
    },
    venues: payload.theatre_ids?.length > 0
      ? payload.theatre_ids.map((id, index) => ({ id, name: payload.theatre_names[index] }))
      : undefined,
    alert_date: payload.date,
    filters: {
      formats: payload.formats || [],
      languages: payload.languages || [],
      show_time_min: narrowedBound(payload.show_time_min, SHOW_TIME_RANGE.min),
      show_time_max: narrowedBound(payload.show_time_max, SHOW_TIME_RANGE.max),
      price_min: narrowedBound(payload.price_min, PRICE_RANGE.min),
      price_max: narrowedBound(payload.price_max, PRICE_RANGE.max),
    },
  }
}

export async function createAlert(payload: CreateAlertFormData): Promise<Alert> {
  const res = await apiClient.post<{ data: Alert }>('/api/alerts', buildAlertPayload(payload))
  return res.data.data
}

export async function cancelAlert(id: string): Promise<void> {
  await apiClient.delete(`/api/alerts/${id}`)
}

export async function restoreAlert(id: string): Promise<void> {
  await apiClient.post(`/api/alerts/${id}/restore`)
}

export const MAX_ACTIVE_ALERTS = 3
