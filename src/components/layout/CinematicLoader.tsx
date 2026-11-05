import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const SEEN_KEY = 'fdfsclub-intro-seen'

function shouldPlayIntro(): boolean {
  try {
    if (window.location.pathname !== '/') return false
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    if (sessionStorage.getItem(SEEN_KEY)) return false
    sessionStorage.setItem(SEEN_KEY, '1')
    return true
  } catch {
    return false
  }
}

export default function CinematicLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(shouldPlayIntro)

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            role="status"
            aria-label="Loading FDFSClub"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 28,
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.12, scale: 1 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '80vw', height: '80vh',
                background: 'radial-gradient(circle, #e8c97d 0%, transparent 60%)',
                filter: 'blur(120px)',
              }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10 }}
            >
              <div style={{ width: 56, height: 56, color: 'var(--accent)' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true" focusable="false">
                  <rect x="25" y="20" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="4.5" />
                  <circle cx="25" cy="50" r="6" fill="#000" stroke="currentColor" strokeWidth="4.5" />
                  <circle cx="75" cy="50" r="6" fill="#000" stroke="currentColor" strokeWidth="4.5" />
                  <path d="M 40 40 L 60 40 M 40 60 L 60 60" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 6vw, 56px)',
                  fontWeight: 800,
                  color: 'var(--text)',
                  textAlign: 'center',
                  letterSpacing: '-0.5px',
                }}
              >
                FDFSClub
              </motion.div>
            </motion.div>

            <div style={{ width: 180, height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', zIndex: 10 }}>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: 'easeInOut'
                }}
                style={{
                  width: '50%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                position: 'absolute', bottom: 40,
                fontSize: 11, letterSpacing: '1.4px',
                color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600
              }}
            >
              Getting things ready
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </>
  )
}
