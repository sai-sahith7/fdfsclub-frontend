import Cookies from 'universal-cookie'

const TOKEN_COOKIE = 'token'
const RETURN_TO_KEY = 'fdfsclub-return-to'
const TELEGRAM_CODE_KEY = 'fdfsclub-telegram-code'
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

const cookies = new Cookies()

export function getToken(): string | undefined {
  return cookies.get<string>(TOKEN_COOKIE)
}

export function saveToken(token: string) {
  cookies.set(TOKEN_COOKIE, token, {
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  })
}

export function clearToken() {
  cookies.remove(TOKEN_COOKIE, { path: '/' })
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function hasValidToken(): boolean {
  const token = getToken()
  return !!token && !isTokenExpired(token)
}

export function takeTokenFromUrl(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const token = hash.get('token')
  if (token || window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  return token
}

function safeSessionStorage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function rememberReturnTo(path: string) {
  const storage = safeSessionStorage()
  if (!storage) return
  if (path.startsWith('/') && !path.startsWith('//')) {
    const url = new URL(path, window.location.origin)
    const code = url.searchParams.get('code')
    if (code) {
      storage.setItem(TELEGRAM_CODE_KEY, code)
      url.searchParams.delete('code')
      path = url.pathname + url.search + url.hash
    }
  }
  storage.setItem(RETURN_TO_KEY, path)
}

export function takePendingTelegramCode(): string {
  const storage = safeSessionStorage()
  const code = storage?.getItem(TELEGRAM_CODE_KEY) ?? ''
  storage?.removeItem(TELEGRAM_CODE_KEY)
  return code
}

export function takeReturnTo(fallback = '/dashboard'): string {
  const storage = safeSessionStorage()
  const path = storage?.getItem(RETURN_TO_KEY)
  storage?.removeItem(RETURN_TO_KEY)
  return path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : fallback
}
