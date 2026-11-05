import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getProfile } from '@/api/user'
import { useAuthStore } from '@/store/authStore'
import { clearToken, saveToken, takeReturnTo, takeTokenFromUrl } from '@/store/session'

export function useGoogleTokenExchange(): string {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const token = takeTokenFromUrl()
    if (!token) {
      navigate('/', { replace: true })
      return
    }

    saveToken(token)

    getProfile()
      .then((user) => {
        setAuth(user)
        navigate(takeReturnTo(), { replace: true })
      })
      .catch(() => {
        clearToken()
        setError("We couldn't sign you in. Please try again.")
      })
  }, [navigate, setAuth])

  return error
}

export function useSignOut() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearToken()
    clearAuth()
    queryClient.clear()
    navigate('/')
  }
}
