import { apiClient } from './client'
import type { User } from '@/types'

export interface ProfilePatch {
  name?: string
  favourite_city?: string | null
}

export async function getProfile(): Promise<User> {
  const res = await apiClient.get<{ data: User }>('/api/user/me')
  return res.data.data
}

export async function updateProfile(patch: ProfilePatch): Promise<User> {
  const res = await apiClient.patch<{ data: User }>('/api/user/me', patch)
  return res.data.data
}

export async function setFavouriteCity(citySlug: string | null): Promise<User> {
  return updateProfile({ favourite_city: citySlug })
}

export interface ResolvedLocation {
  user: User
  city: { id: number; name: string; slug: string }
  catalog_loading: boolean
}

export async function resolveLocation(lat: number, lng: number): Promise<ResolvedLocation> {
  const res = await apiClient.post<{ data: ResolvedLocation }>('/api/user/location', { lat, lng })
  return res.data.data
}
