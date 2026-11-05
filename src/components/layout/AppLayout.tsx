import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import AuthModal from '@/components/auth/AuthModal'
import { useAuthModalStore } from '@/store/authModalStore'

const DEFAULT_TITLE = 'FDFSClub · Alerts when tickets open'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Your alerts',
  '/create': 'New alert',
  '/telegram': 'Telegram',
  '/profile': 'Profile',
}

export default function AppLayout() {
  const isOpen = useAuthModalStore((s) => s.isOpen)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const path = location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
    const page = path === '/' ? null : PAGE_TITLES[path] ?? 'Page not found'
    document.title = page ? `${page} · FDFSClub` : DEFAULT_TITLE
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: isLanding ? 0 : 80, paddingBottom: 40 }}>
        <div className={isLanding ? '' : 'app-container'}>
          <Outlet />
        </div>
      </main>
      {isOpen && <AuthModal />}
    </div>
  )
}