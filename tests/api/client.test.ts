import { describe, test, expect, beforeEach, vi } from 'vitest'
import type { AxiosAdapter } from 'axios'
import { apiClient } from '@/api/client'
import { getToken, saveToken } from '@/store/session'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

const jwt = (exp: number) => `h.${btoa(JSON.stringify({ exp })).replace(/=+$/, '')}.s`
const now = () => Math.floor(Date.now() / 1000)

function respondWith(status: number) {
  const seen: { authorization?: string }[] = []
  const adapter: AxiosAdapter = async (config) => {
    seen.push({ authorization: config.headers.Authorization as string | undefined })
    const response = { data: {}, status, statusText: '', headers: {}, config }
    if (status >= 400) throw Object.assign(new Error(`HTTP ${status}`), { isAxiosError: true, response, config })
    return response
  }
  apiClient.defaults.adapter = adapter
  return seen
}

let assign: ReturnType<typeof vi.fn>

beforeEach(() => {
  document.cookie = 'token=; path=/; max-age=0'
  useAuthStore.setState({ isLoggedIn: true, user: { email: 'a@b.c' } as User })
  window.history.replaceState(null, '', '/dashboard')
  assign = vi.fn()
  Object.defineProperty(window, 'location', { value: { ...window.location, pathname: '/dashboard', search: '', assign }, writable: true })
})

describe('expired sessions', () => {
  test('a 401 after the token cookie is gone still signs out and redirects to sign in', async () => {
    respondWith(401)
    await expect(apiClient.get('/api/alerts')).rejects.toThrow()
    expect(useAuthStore.getState().isLoggedIn).toBe(false)
    expect(assign).toHaveBeenCalledWith('/?session_expired=1')
  })

  test('an expired token is never sent; the session ends before the request', async () => {
    saveToken(jwt(now() - 60))
    const seen = respondWith(200)
    await apiClient.get('/api/cities')
    expect(seen[0].authorization).toBeUndefined()
    expect(getToken()).toBeUndefined()
    expect(useAuthStore.getState().isLoggedIn).toBe(false)
    expect(assign).toHaveBeenCalledWith('/?session_expired=1')
  })

  test('a valid token is sent and the session is kept', async () => {
    const token = jwt(now() + 3600)
    saveToken(token)
    const seen = respondWith(200)
    await apiClient.get('/api/alerts')
    expect(seen[0].authorization).toBe(`Bearer ${token}`)
    expect(useAuthStore.getState().isLoggedIn).toBe(true)
    expect(assign).not.toHaveBeenCalled()
  })

  test('a 401 for a signed-out visitor does not redirect', async () => {
    useAuthStore.setState({ isLoggedIn: false, user: null })
    respondWith(401)
    await expect(apiClient.post('/api/movies/refresh')).rejects.toThrow()
    expect(assign).not.toHaveBeenCalled()
  })
})
