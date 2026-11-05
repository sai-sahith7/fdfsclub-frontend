import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { motion } from 'framer-motion'
import { Bell, Film, Send } from 'lucide-react'

export default function TelegramPreviewSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuth = useAuthModalStore((s) => s.open)

  return (
    <section aria-labelledby="telegram-title" style={{ padding: 'clamp(64px, 10vw, 80px) 0', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: 800, height: 800, background: 'var(--blue)', filter: 'blur(300px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />

      <div className="landing-container" style={{ position: 'relative', zIndex: 10, maxWidth: 960 }}>
        <div className="telegram-layout" style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', perspective: 1000 }}
            aria-hidden="true"
          >
            <motion.div
              animate={{ y: [-15, 15, -15], rotateX: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              style={{
                width: '100%',
                maxWidth: 420,
                background: 'linear-gradient(145deg, rgba(18,18,18,0.9) 0%, rgba(10,10,10,0.7) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  color: 'var(--text2)',
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(110, 168, 254, 0.4)'
                  }}
                >
                  <Send size={16} strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 500, letterSpacing: 0 }}>FDFSClub · just now</span>
              </div>
              
              <div style={{ padding: 'clamp(20px, 6vw, 32px)', display: 'flex', gap: 20 }}>
                <div
                  style={{
                    width: 64, height: 88, borderRadius: 12, background: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', flexShrink: 0,
                    border: '1px solid rgba(202, 138, 4, 0.3)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  <Film size={32} strokeWidth={1} />
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    <Bell size={18} color="var(--accent)" /> Tickets are open!
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6, fontWeight: 300 }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 500 }}>The Last Show (IMAX)</strong><br />
                    PVR IMAX, Phoenix Palladium<br />
                    Fri, 18 Dec · 8:00 PM
                  </div>
                </div>
              </div>
              
              <div
                style={{
                  margin: '0 clamp(20px, 6vw, 32px) clamp(20px, 6vw, 32px)',
                  padding: '16px',
                  borderRadius: 16,
                  background: 'rgba(110, 168, 254, 0.1)',
                  border: '1px solid rgba(110, 168, 254, 0.3)',
                  color: 'var(--blue)',
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: 0
                }}
              >
                Book now
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <h2 id="telegram-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 24, lineHeight: 1.1, letterSpacing: '-0.5px', color: 'var(--text)' }}>
              Faster on <span style={{ color: 'var(--blue)' }}>Telegram</span>
            </h2>

            <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--text2)', lineHeight: 1.6, marginBottom: 48, maxWidth: 500, fontWeight: 300 }}>
              Email can sit unread. A Telegram message pops up on your lock screen when tickets open, with a link to book.
            </p>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(110, 168, 254, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isLoggedIn ? navigate('/telegram') : openAuth()}
              style={{
                width: 'fit-content',
                padding: '16px 32px',
                minHeight: 48,
                borderRadius: 500,
                border: '1px solid rgba(110, 168, 254, 0.5)',
                background: 'rgba(110, 168, 254, 0.1)',
                color: 'var(--blue)',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'var(--font-body)',
                textTransform: 'uppercase',
                letterSpacing: 0
              }}
            >
              <Send size={18} aria-hidden="true" /> {isLoggedIn ? 'Connect Telegram' : 'Get started'}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .telegram-layout {
            flex-direction: row-reverse !important;
            align-items: center;
            gap: 64px !important;
          }
        }
      `}</style>
    </section>
  )
}