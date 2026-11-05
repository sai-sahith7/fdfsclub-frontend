import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import CinematicLoader from '@/components/layout/CinematicLoader'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import LandingPage from '@/pages/LandingPage'
import GoogleTokenPage from '@/pages/GoogleTokenPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { useAuthStore } from '@/store/authStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { rememberReturnTo } from '@/store/session'

const RELOADED_KEY = 'fdfsclub-chunk-reload'

function markChunkReload(): boolean {
  try {
    const alreadyReloaded = Boolean(sessionStorage.getItem(RELOADED_KEY))
    sessionStorage.setItem(RELOADED_KEY, '1')
    return alreadyReloaded
  } catch {
    return true
  }
}

function clearChunkReload() {
  try {
    sessionStorage.removeItem(RELOADED_KEY)
  } catch {
    return
  }
}

function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  return lazy(() =>
    load().then(
      (page) => {
        clearChunkReload()
        return page
      },
      (error) => {
        if (markChunkReload()) throw error
        window.location.reload()
        return new Promise<never>(() => {})
      }
    )
  )
}

const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'))
const CreateAlertPage = lazyPage(() => import('@/pages/CreateAlertPage'))
const TelegramPage = lazyPage(() => import('@/pages/TelegramPage'))
const ProfilePage = lazyPage(() => import('@/pages/ProfilePage'))

function PageLoader() {
  return (
    <div role="status" style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuth = useAuthModalStore((s) => s.open)
  const location = useLocation()

  useEffect(() => {
    if (isLoggedIn) return
    rememberReturnTo(location.pathname + location.search)
    openAuth('return')
  }, [isLoggedIn, location.pathname, location.search, openAuth])

  return isLoggedIn
    ? <Suspense key={location.pathname} fallback={<PageLoader />}>{children}</Suspense>
    : <Navigate to="/" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
    <CinematicLoader>
      <Routes>
      <Route path="/googleToken" element={<GoogleTokenPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateAlertPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/telegram"
          element={
            <ProtectedRoute>
              <TelegramPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
    </CinematicLoader>
    </ErrorBoundary>
  )
}