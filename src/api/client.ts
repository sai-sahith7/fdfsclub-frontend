import axios from 'axios'
import { clearToken, getToken, isTokenExpired, rememberReturnTo } from '@/store/session'
import { useAuthStore } from '@/store/authStore'
import { useAuthModalStore } from '@/store/authModalStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

export function endSession() {
  clearToken()
  useAuthStore.getState().clearAuth()
  if (window.location.pathname !== '/') {
    rememberReturnTo(window.location.pathname + window.location.search)
    window.location.assign('/?session_expired=1')
  } else {
    useAuthModalStore.getState().open('expired')
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token && isTokenExpired(token)) {
    endSession()
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && (getToken() || useAuthStore.getState().isLoggedIn)) {
      endSession()
    }
    return Promise.reject(err)
  }
)
