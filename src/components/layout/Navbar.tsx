import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSignOut } from '@/hooks/useAuth'

export default function Navbar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)
  const openAuth = useAuthModalStore((s) => s.open)
  const signOut = useSignOut()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handler), 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handler)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileMenuOpen])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase()

  const isActive = (path: string) => location.pathname === path

  const handleNav = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        aria-label="Main"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          padding: '0 16px',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Link to="/" aria-label="FDFSClub home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', zIndex: 102 }}>
            <motion.div
              aria-hidden="true"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true" focusable="false">
                <rect x="25" y="20" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="4.5" />
                <circle cx="25" cy="50" r="6" fill="#000" stroke="currentColor" strokeWidth="4.5" />
                <circle cx="75" cy="50" r="6" fill="#000" stroke="currentColor" strokeWidth="4.5" />
                <path d="M 40 40 L 60 40 M 40 60 L 60 60" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </motion.div>
            <span style={{
              fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
              color: 'var(--text)', letterSpacing: 0
            }}>
              FDFSClub
            </span>
          </Link>

          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isLoggedIn ? (
              <>
                <NavLink active={isActive('/dashboard')} onClick={() => navigate('/dashboard')}>My alerts</NavLink>
                <NavLink active={isActive('/telegram')} onClick={() => navigate('/telegram')}>Telegram</NavLink>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/create')}
                  style={{
                    padding: '8px 20px', borderRadius: 500, border: 'none',
                    background: 'var(--accent)', color: '#000', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  New alert
                </motion.button>
                <motion.button
                  type="button"
                  aria-label="Your profile"
                  aria-current={isActive('/profile') ? 'page' : undefined}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'var(--bg3)', padding: 0,
                    border: 'none', cursor: 'pointer', marginLeft: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {user?.image_url ? (
                    <img src={user.image_url} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : initials}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openAuth()}
                  style={{
                    padding: '8px 20px', borderRadius: 500, border: 'none',
                    background: 'var(--accent)', color: '#000', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  Sign in
                </motion.button>
              </>
            )}
          </div>

          <div className="nav-mobile-toggle">
            <motion.button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen) }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, minWidth: 44, minHeight: 44,
                zIndex: 112,
                position: 'relative',
              }}
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </motion.button>
          </div>
        </div>

        <style>{`
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: block; z-index: 112; }
          @media (min-width: 768px) {
            .nav-desktop { display: flex !important; }
            .nav-mobile-toggle { display: none !important; }
          }
        `}</style>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 109,
                background: 'rgba(0,0,0,0.6)',
              }}
            />

            <motion.div
              id="mobile-menu"
              role="menu"
              aria-label="Menu"
              ref={menuRef}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: 64,
                right: 16,
                zIndex: 110,
                width: 'min(240px, calc(100vw - 32px))',
                background: 'var(--bg2)',
                border: '1px solid var(--border-md)',
                borderRadius: 12,
                padding: '8px 0',
                boxShadow: 'var(--shadow-heavy)',
              }}
            >
              {isLoggedIn ? (
                <>
                  {!isActive('/create') && (
                    <div style={{ padding: '4px 12px 8px' }}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav('/create')}
                        className="pill-btn pill-btn-primary"
                        style={{ width: '100%', minHeight: 44 }}
                      >
                        New alert
                      </button>
                    </div>
                  )}
                  <MobileMenuItem label="My alerts" active={isActive('/dashboard')} onClick={() => handleNav('/dashboard')} />
                  <MobileMenuItem label="Telegram alerts" active={isActive('/telegram')} onClick={() => handleNav('/telegram')} />
                  <MobileMenuItem label="Profile" active={isActive('/profile')} onClick={() => handleNav('/profile')} />
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />
                  <MobileMenuItem label="Sign out" danger onClick={() => { setMobileMenuOpen(false); signOut() }} />
                </>
              ) : (
                <>
                  <MobileMenuItem label="Home" active={isActive('/')} onClick={() => handleNav('/')} />
                  <MobileMenuItem label="Sign in" onClick={() => { openAuth(); setMobileMenuOpen(false) }} />
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-current={active ? 'page' : undefined}
      whileHover={{ color: '#fff' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: active ? 700 : 400,
        color: active ? 'var(--text)' : 'var(--text2)',
        padding: '8px 16px', borderRadius: 9999,
        fontFamily: 'var(--font-body)',
        transition: 'color 0.2s',
      }}
    >
      {children}
    </motion.button>
  )
}

function MobileMenuItem({ label, onClick, active, danger }: { label: string; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left', minHeight: 44,
        padding: '12px 20px 12px 17px', background: 'none', border: 'none',
        borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
        fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500,
        color: danger ? 'var(--red)' : active ? 'var(--accent)' : 'var(--text)',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg3)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {label}
    </button>
  )
}