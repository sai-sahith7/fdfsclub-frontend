import { describe, test, expect } from 'vitest'
import { dedupeIgnoreCase } from '@/components/create-alert/filters'

describe('dedupeIgnoreCase', () => {
  test('collapses values that differ only by case', () => {
    expect(dedupeIgnoreCase(['Telugu', 'TELUGU', 'telugu'])).toEqual(['Telugu'])
  })

  test('keeps genuinely different values', () => {
    expect(dedupeIgnoreCase(['Telugu', 'Tamil', 'Hindi'])).toEqual(['Telugu', 'Tamil', 'Hindi'])
  })

  test('keeps the all-caps variant when it is the only cased form', () => {
    expect(dedupeIgnoreCase(['imax', 'IMAX'])).toEqual(['IMAX'])
  })

  test('prefers mixed case over shouting', () => {
    expect(dedupeIgnoreCase(['ENGLISH', 'English'])).toEqual(['English'])
  })

  test('preserves order of first appearance', () => {
    expect(dedupeIgnoreCase(['4DX', '2D', '4dx', '3D'])).toEqual(['4DX', '2D', '3D'])
  })

  test('trims whitespace before comparing', () => {
    expect(dedupeIgnoreCase([' Hindi ', 'hindi'])).toEqual(['Hindi'])
  })

  test('drops blanks and nullish entries', () => {
    expect(dedupeIgnoreCase(['Hindi', '', null, undefined, '   '])).toEqual(['Hindi'])
  })

  test('returns an empty array for missing input', () => {
    expect(dedupeIgnoreCase(null)).toEqual([])
    expect(dedupeIgnoreCase(undefined)).toEqual([])
    expect(dedupeIgnoreCase([])).toEqual([])
  })

  test('every dropped variant is still matched by a surviving one', () => {
    const original = ['IMAX', 'imax', 'Imax 3D', 'IMAX 3D']
    const deduped = dedupeIgnoreCase(original)

    for (const value of original) {
      expect(deduped.some((kept) => kept.toLowerCase() === value.toLowerCase())).toBe(true)
    }
  })
})
