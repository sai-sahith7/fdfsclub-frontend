import { apiClient } from './client'
import type { City, Venue } from '@/types'

export async function getCities(): Promise<City[]> {
  const res = await apiClient.get<{ data: City[] }>('/api/cities')
  return res.data.data
}

export async function getTheatres(citySlug: string): Promise<Venue[]> {
  const res = await apiClient.get<{ data: Venue[] }>(`/api/cities/${encodeURIComponent(citySlug)}/venues`)
  return res.data.data
}

export async function refreshVenues(citySlug: string): Promise<{ message: string; refreshed: boolean; moreComing: boolean }> {
  const res = await apiClient.post<{ message: string; data: { refreshed: boolean; more_coming?: boolean } }>(
    `/api/cities/${encodeURIComponent(citySlug)}/venues/refresh`
  )
  return {
    message: res.data.message,
    refreshed: res.data.data?.refreshed ?? false,
    moreComing: res.data.data?.more_coming ?? false,
  }
}
