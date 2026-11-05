import { describe, test, expect, beforeEach } from 'vitest'
import { isTokenExpired, rememberReturnTo, takeReturnTo, takeTokenFromUrl, takePendingTelegramCode } from '@/store/session'

beforeEach(() => sessionStorage.clear())

describe('return-to path', () => {
  test('returns the remembered path once', () => {
    rememberReturnTo('/create?step=2')
    expect(takeReturnTo()).toBe('/create?step=2')
    expect(takeReturnTo()).toBe('/dashboard')
  })

  test('keeps a Telegram link code out of the remembered path', () => {
    rememberReturnTo('/telegram?code=123456')
    expect(takeReturnTo()).toBe('/telegram')
    expect(takePendingTelegramCode()).toBe('123456')
    expect(takePendingTelegramCode()).toBe('')
  })

  test('ignores off-site targets', () => {
    rememberReturnTo('//evil.example.com')
    expect(takeReturnTo()).toBe('/dashboard')
    rememberReturnTo('https://evil.example.com')
    expect(takeReturnTo()).toBe('/dashboard')
  })
})

const jwt = (payload: object) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')}.s`

describe('token expiry', () => {
  test('a token past its exp is expired, one before it is not', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(isTokenExpired(jwt({ exp: now - 1 }))).toBe(true)
    expect(isTokenExpired(jwt({ exp: now + 3600 }))).toBe(false)
  })

  test('a malformed token counts as expired', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
  })
})

describe('token from the sign-in redirect', () => {
  test('reads the token from the hash and clears it from the URL', () => {
    window.history.replaceState(null, '', '/googleToken#token=abc')
    expect(takeTokenFromUrl()).toBe('abc')
    expect(window.location.hash).toBe('')
  })

  test('ignores a token in the query string', () => {
    window.history.replaceState(null, '', '/googleToken?token=abc')
    expect(takeTokenFromUrl()).toBeNull()
  })
})
