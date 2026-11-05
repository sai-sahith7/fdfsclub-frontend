import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuthModalStore } from '@/store/authModalStore'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Play } from 'lucide-react'
import { useRef } from 'react'

export default function HeroSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuth = useAuthModalStore((s) => s.open)
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const handleCreate = () => {
    if (isLoggedIn) navigate('/create')
    else openAuth()
  }

  return (
    <section ref={ref} aria-labelledby="hero-title" style={{ position: 'relative', minHeight: 'max(600px, 100svh)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(232,201,125,0.08) 0%, transparent 60%)', zIndex: 0 }} />

      <motion.div
        style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: 900, padding: '96px 16px 64px', y: yText, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 id="hero-title" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 9vw, 80px)', lineHeight: 1.05,
            fontWeight: 800, marginBottom: 24, letterSpacing: '-0.5px',
          }}>
            <span className="text-gradient" style={{ display: 'block' }}>Tickets open.</span>
            <span style={{ display: 'block', color: 'var(--accent)', textWrap: 'balance' }}>You hear first.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text2)', maxWidth: 540, margin: '0 auto 48px',
            lineHeight: 1.6, fontWeight: 400
          }}>
            Pick a movie, a date and your theatres. We'll message you when tickets open.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(232,201,125,0.3)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCreate}
              style={{
                padding: '14px 40px', minHeight: 48, borderRadius: 500, border: 'none',
                background: 'var(--accent)', color: '#000',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-body)', letterSpacing: '1.4px', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              {isLoggedIn ? 'Create an alert' : 'Create a free alert'} <Play size={16} fill="#000" stroke="#000" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)', zIndex: 5 }} />
    </section>
  )
}