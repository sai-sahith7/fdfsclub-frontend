import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { MAX_ACTIVE_ALERTS } from '@/api/alerts'

const FAQS = [
  {
    q: 'How quickly will I hear about tickets?',
    a: 'We check your alerts every few minutes, day and night, and message you as soon as tickets open for a matching show.',
  },
  {
    q: 'Do I need Telegram?',
    a: 'No. Every alert is sent by email. Telegram is optional, but it usually reaches you faster.',
  },
  {
    q: 'Does FDFSClub book tickets for me?',
    a: 'No. We tell you when tickets open and link you straight to the booking page, where you pick your seats and pay as usual.',
  },
  {
    q: 'What happens after an alert is sent?',
    a: 'Each alert is sent once, then moves to your past alerts. If the date passes without tickets opening, it expires on its own.',
  },
  {
    q: 'How many alerts can I have?',
    a: `Up to ${MAX_ACTIVE_ALERTS} active alerts at a time. Once one is sent, expires or is cancelled, you can add another.`,
  },
  {
    q: 'How much does it cost?',
    a: 'Nothing. FDFSClub is free. Sign in with Google to start creating alerts.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section aria-labelledby="faq-title" style={{ padding: 'clamp(64px, 10vw, 100px) 0', background: 'var(--bg)' }}>
      <div className="landing-container" style={{ maxWidth: 960 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 48 }}
        >
          <h2 id="faq-title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            Common <span style={{ color: 'var(--accent)' }}>questions</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 style={{ margin: 0 }}>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: '100%', padding: '24px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: isOpen ? 'var(--accent)' : 'var(--text)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700,
                    textAlign: 'left', gap: 20,
                    transition: 'color 0.2s', letterSpacing: 0,
                  }}
                >
                  {item.q}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ flexShrink: 0, color: isOpen ? 'var(--accent)' : 'var(--text3)' }}
                  >
                    {isOpen ? <Minus size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
                  </motion.div>
                </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingBottom: 28, fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 560 }}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}