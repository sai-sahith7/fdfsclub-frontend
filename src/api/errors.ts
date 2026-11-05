import axios from 'axios'

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const message = (err.response?.data as { message?: unknown } | undefined)?.message
    if (!err.response) return 'You seem to be offline. Check your connection and try again.'
    if (status && status >= 400 && status < 500 && typeof message === 'string' && message.trim()) {
      return message
    }
  }
  return fallback
}

export function getErrorCode(err: unknown): string | undefined {
  if (!axios.isAxiosError(err)) return undefined
  const code = (err.response?.data as { code?: unknown } | undefined)?.code
  return typeof code === 'string' ? code : undefined
}
