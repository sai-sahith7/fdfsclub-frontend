import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Pick your movie',
    desc: "Choose your city and the movie you're waiting for, even before tickets open.",
  },
  {
    num: '02',
    title: 'Narrow it down',
    desc: 'Pick a date, and any theatre or just your favourites. Filter by format, language, show time and price if you like.',
  },
  {
    num: '03',
    title: 'Get the message',
    desc: 'We check every few minutes, day and night. When matching tickets open, you get a Telegram message and an email with a booking link.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" style={{ padding: 'clamp(64px, 10vw, 100px) 0', position: 'relative', background: 'var(--bg)' }}>
      <div className="landing-container" style={{ position: 'relative', zIndex: 10, maxWidth: 960 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 60 }}
        >
          <h2 id="how-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            How it <span style={{ color: 'var(--accent)' }}>works</span>
          </h2>
        </motion.div>

        <div className="how-it-works-grid" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--bg3)',
                  border: '1px solid rgba(232,201,125,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: 'var(--accent)', marginBottom: 24,
                  boxShadow: '0 0 30px rgba(232,201,125,0.08)',
                }}
              >
                {step.num}
              </div>

              <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, color: 'var(--text)', letterSpacing: 0 }}>
                {step.title}
              </h3>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 300 }}>
                {step.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .how-it-works-grid {
            flex-direction: row !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}