export interface City {
  _id: string
  name: string
  state_key?: string
  slug: string
  latitude?: number
  longitude?: number
  image_url?: string
  is_active?: boolean
  last_movie_sync_at?: string
}

export interface Movie {
  contentId: string | number
  name: string
  image_url?: string
  runtime_minutes?: number
  censor?: string
  frmtids?: string[]
  languages?: string[]
  screen_formats?: string[]
  release_date?: string | null
  booking_status?: string | null
}

export type VenueSource = 'district' | 'bookmyshow'

export interface Venue {
  _id: string
  name: string
  source?: VenueSource
  address?: string
  city_name?: string
  provider_id?: number
  cinema_id?: number
  location?: { type: 'Point'; coordinates: [number, number] }
  extras?: { chain?: string; amenities?: string[] }
}

export type AlertStatus = 'ACTIVE' | 'ALERTED' | 'CANCELLED' | 'EXPIRED'

export interface AlertFilters {
  formats: string[]
  languages: string[]
  show_time_min?: number | null
  show_time_max?: number | null
  price_min?: number | null
  price_max?: number | null
}

export interface Alert {
  _id: string
  user_email: string
  movie: {
    id: string
    name: string
    image_url?: string
  }
  city: {
    name: string
  }
  venues?: {
    id: string
    name: string | null
    source?: VenueSource
  }[]
  alert_date: string
  status: AlertStatus
  filters: AlertFilters
  last_scan_group_key?: string
  last_checked_at?: string
  notified_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface User {
  _id: string
  email: string
  name: string
  image_url?: string
  default_city?: {
    name: string | null
    slug: string | null
  }
  favourite_city?: {
    name: string | null
    slug: string | null
  }
  telegram?: {
    chat_id: string
    username: string
    connected: boolean
  }
  created_at: string
  updated_at: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
  has_more: boolean
}

export interface PaginatedResponse<T> {
  alerts: T[]
  pagination: Pagination
}

export interface CreateAlertFormData {
  city: string
  city_name?: string
  movie_name: string
  movie_id?: string
  movie_poster?: string
  movie_release_date?: string | null
  date: string
  theatre_ids: string[]
  theatre_names: string[]
  formats: string[]
  languages: string[]
  available_formats?: string[]
  available_languages?: string[]
  show_time_min?: number
  show_time_max?: number
  price_min?: number
  price_max?: number
}