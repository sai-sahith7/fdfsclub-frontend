import { describe, test, expect } from 'vitest'
import { getAlertDateOptions, toIsoDate, formatReleaseLabel, ALERT_DATE_WINDOW_DAYS } from '@/components/ui/dates'

const NOW = new Date('2026-07-26T06:30:00Z')

describe('getAlertDateOptions', () => {
  test('starts today when the movie is already released', () => {
    expect(getAlertDateOptions('2026-07-01', NOW)[0].iso).toBe('2026-07-26')
  })

  test('starts at the release date when the movie has not released yet', () => {
    expect(getAlertDateOptions('2026-07-30', NOW)[0].iso).toBe('2026-07-30')
  })

  test('starts today when the movie releases today', () => {
    expect(getAlertDateOptions('2026-07-26', NOW)[0].iso).toBe('2026-07-26')
  })

  test('spans the start date through +10 days inclusive', () => {
    const options = getAlertDateOptions('2026-07-30', NOW)
    expect(options).toHaveLength(ALERT_DATE_WINDOW_DAYS + 1)
    expect(options[0].iso).toBe('2026-07-30')
    expect(options[options.length - 1].iso).toBe('2026-08-09')
  })

  test('returns consecutive days with no gaps or repeats', () => {
    const isoDates = getAlertDateOptions(null, NOW).map((option) => option.iso)
    expect(new Set(isoDates).size).toBe(isoDates.length)

    for (let i = 1; i < isoDates.length; i++) {
      const previous = new Date(`${isoDates[i - 1]}T00:00:00Z`).getTime()
      const current = new Date(`${isoDates[i]}T00:00:00Z`).getTime()
      expect(current - previous).toBe(86400000)
    }
  })

  test('crosses month boundaries correctly', () => {
    const options = getAlertDateOptions(null, new Date('2026-01-28T06:30:00Z'))
    expect(options[0].iso).toBe('2026-01-28')
    expect(options[options.length - 1].iso).toBe('2026-02-07')
  })

  test('falls back to today for missing or unparseable release dates', () => {
    expect(getAlertDateOptions(undefined, NOW)[0].iso).toBe('2026-07-26')
    expect(getAlertDateOptions(null, NOW)[0].iso).toBe('2026-07-26')
    expect(getAlertDateOptions('coming soon', NOW)[0].iso).toBe('2026-07-26')
  })

  test('accepts a full ISO timestamp as the release date', () => {
    expect(getAlertDateOptions('2026-07-30T00:00:00.000Z', NOW)[0].iso).toBe('2026-07-30')
  })

  test('labels each option with weekday, day number and month', () => {
    const [first] = getAlertDateOptions('2026-07-30', NOW)
    expect(first.day).toBe('Thu')
    expect(first.num).toBe(30)
    expect(first.mon).toBe('Jul')
  })

  test('uses the IST calendar day, not the UTC one', () => {
    expect(getAlertDateOptions(null, new Date('2026-07-25T19:00:00Z'))[0].iso).toBe('2026-07-26')
  })

  test('honours a custom window size', () => {
    expect(getAlertDateOptions(null, NOW, 3)).toHaveLength(4)
  })
})

describe('toIsoDate', () => {
  test('formats an instant as the IST calendar day', () => {
    expect(toIsoDate(new Date('2026-07-25T19:00:00Z'))).toBe('2026-07-26')
    expect(toIsoDate(new Date('2026-07-25T17:00:00Z'))).toBe('2026-07-25')
  })
})

describe('formatReleaseLabel', () => {
  test('names the day for an upcoming release', () => {
    expect(formatReleaseLabel('2026-07-30', NOW)).toBe('Releases Thu 30 Jul')
  })

  test('says today on release day, using the India date', () => {
    expect(formatReleaseLabel('2026-07-27', new Date('2026-07-26T19:00:00Z'))).toBe('Releases today')
  })

  test('says in theatres once released', () => {
    expect(formatReleaseLabel('2026-07-01', NOW)).toBe('In theatres')
  })

  test('returns nothing without a usable date', () => {
    expect(formatReleaseLabel(null, NOW)).toBeNull()
    expect(formatReleaseLabel('coming soon', NOW)).toBeNull()
  })
})
