import { describe, test, expect } from 'vitest'
import { hasSensitiveUrl } from '@/analytics'

describe('analytics URL check', () => {
  test('flags a sign-in token in the hash', () => {
    expect(hasSensitiveUrl({ search: '', hash: '#token=abc.def.ghi' })).toBe(true)
  })

  test('flags a Telegram link code in the query', () => {
    expect(hasSensitiveUrl({ search: '?code=123456', hash: '' })).toBe(true)
  })

  test('allows ordinary URLs', () => {
    expect(hasSensitiveUrl({ search: '?session_expired=1', hash: '' })).toBe(false)
    expect(hasSensitiveUrl({ search: '', hash: '#faq' })).toBe(false)
  })
})
