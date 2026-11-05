import { describe, test, expect } from 'vitest'
import { buildAlertPayload } from '@/api/alerts'
import type { CreateAlertFormData } from '@/types'

const BASE: CreateAlertFormData = {
  city: 'bengaluru',
  city_name: 'Bengaluru',
  movie_name: 'Alpha',
  movie_id: '100',
  date: '2026-10-01',
  theatre_ids: [],
  theatre_names: [],
  formats: [],
  languages: [],
  show_time_min: 0,
  show_time_max: 1439,
  price_min: 0,
  price_max: 2000,
}

describe('buildAlertPayload', () => {
  test('untouched sliders send no time or price limits', () => {
    const { filters } = buildAlertPayload(BASE)
    expect(filters.show_time_min).toBeNull()
    expect(filters.show_time_max).toBeNull()
    expect(filters.price_min).toBeNull()
    expect(filters.price_max).toBeNull()
  })

  test('narrowed bounds are sent as-is', () => {
    const { filters } = buildAlertPayload({ ...BASE, show_time_min: 1080, price_max: 400 })
    expect(filters.show_time_min).toBe(1080)
    expect(filters.show_time_max).toBeNull()
    expect(filters.price_max).toBe(400)
  })

  test('omits venues when none are picked and pairs ids with names otherwise', () => {
    expect(buildAlertPayload(BASE).venues).toBeUndefined()
    const { venues } = buildAlertPayload({ ...BASE, theatre_ids: ['1', '2'], theatre_names: ['PVR', 'INOX'] })
    expect(venues).toEqual([{ id: '1', name: 'PVR' }, { id: '2', name: 'INOX' }])
  })
})
