import { apiClient } from './client'
import type { Movie } from '@/types'

export interface PaginatedMoviesResponse {
  movies: Movie[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MovieSearchParams {
  search?: string
  page?: number
  limit?: number
}

export async function getAllMovies(params: MovieSearchParams = {}): Promise<PaginatedMoviesResponse> {
  const res = await apiClient.get<{
    data: Movie[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
  }>('/api/movies', { params })
  return {
    movies: res.data.data,
    total: res.data.pagination.total,
    page: res.data.pagination.page,
    limit: res.data.pagination.limit,
    totalPages: res.data.pagination.totalPages,
  }
}

export interface MovieFilterOptions {
  formats: string[]
  languages: string[]
  release_date: string | null
}

export async function getFormats(movieId: string, cityName?: string): Promise<MovieFilterOptions> {
  const res = await apiClient.get<{
    data: { format_names: string[]; languages: string[]; release_date: string | null }
  }>(`/api/movies/${encodeURIComponent(movieId)}/formats`, {
    params: cityName ? { city_name: cityName } : undefined,
  })
  return {
    formats: res.data.data.format_names ?? [],
    languages: res.data.data.languages ?? [],
    release_date: res.data.data.release_date ?? null,
  }
}

export async function requestMovie(cityName: string, keyword?: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/api/movies/refresh', {
    city_name: cityName,
    keyword,
  })
  return res.data
}
