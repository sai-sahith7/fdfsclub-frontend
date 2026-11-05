import { apiClient } from './client'

export async function verifyTelegramCode(code: string) {
  const res = await apiClient.post('/api/user/telegram/verify', { code })
  return res.data
}

export async function disconnectTelegram() {
  const res = await apiClient.delete('/api/user/telegram/disconnect')
  return res.data
}