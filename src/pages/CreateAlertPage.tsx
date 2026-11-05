import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateAlertStore } from '@/store/createAlertStore'
import StepIndicator from '@/components/create-alert/StepIndicator'
import Step0City from '@/components/create-alert/Step0City'
import Step1Movie from '@/components/create-alert/Step1Movie'
import Step2DateTheatre from '@/components/create-alert/Step2DateTheatre'
import Step3Filters from '@/components/create-alert/Step3Filters'
import { useAlerts, useCreateAlert } from '@/hooks/useAlerts'
import { MAX_ACTIVE_ALERTS } from '@/api/alerts'
import { getErrorCode, getErrorMessage } from '@/api/errors'
import type { CreateAlertFormData } from '@/types'
import { motion } from 'framer-motion'
import { Bell, ArrowRight, ArrowLeft } from 'lucide-react'

const TOTAL_STEPS = 4

const STEPS = [
  { title: 'City', desc: "Where you'll watch" },
  { title: 'Movie', desc: 'What you want to see' },
  { title: 'Date & theatres', desc: 'When, and where exactly' },
  { title: 'Filters', desc: 'Optional extras' },
]

function canAdvance(step: number, formData: Record<string, unknown>): boolean {
  if (step === 0) return Boolean(formData.city)
  if (step === 1) return Boolean(formData.movie_name)
  if (step === 2) return Boolean(formData.date)
  const priceMin = formData.price_min as number | undefined
  const priceMax = formData.price_max as number | undefined
  return priceMin == null || priceMax == null || priceMin <= priceMax
}

const HINTS = ['Pick a city to continue', 'Pick a movie to continue', 'Pick a date to continue', 'Check the price range']
const NUDGES = ['Pick a city first', 'Pick a movie first', 'Pick a date first', 'Fix the price range first']

export default function CreateAlertPage() {
  const navigate = useNavigate()
  const { step, formData, nextStep, prevStep, resetForm, setStep, nudgeMissing } = useCreateAlertStore()
  const [nudgedStep, setNudgedStep] = useState<number | null>(null)
  const [submittedData, setSubmittedData] = useState<{ city?: string; movie?: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<{ message: string; code?: string } | null>(null)
  const submittingRef = useRef(false)

  const isLast = step === TOTAL_STEPS - 1
  const canNext = canAdvance(step, formData as Record<string, unknown>)

  const isStepClickable = (targetStep: number) => {
    for (let i = 0; i < targetStep; i++) {
      if (!canAdvance(i, formData as Record<string, unknown>)) return false
    }
    return true
  }

  const { mutateAsync: createAlertFn } = useCreateAlert()
  const { data: alerts } = useAlerts()
  const activeCount = alerts?.filter((a) => a.status === 'ACTIVE').length ?? 0

  const handleSubmit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await createAlertFn(formData as CreateAlertFormData)
      setSubmittedData({ city: formData.city_name || formData.city, movie: formData.movie_name })
      resetForm()
    } catch (err) {
      setSubmitError({
        message: getErrorMessage(err, "We couldn't create your alert. Please try again."),
        code: getErrorCode(err),
      })
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  if (submittedData) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100dvh - 200px)', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          aria-hidden="true"
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(232,201,125,0.1)',
            border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', marginBottom: 28,
          }}
        >
          <Bell size={36} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          ref={(el: HTMLHeadingElement | null) => el?.focus()}
          tabIndex={-1}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, marginBottom: 12, letterSpacing: 0, outline: 'none' }}
        >
          You're all set
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}
        >
          Your alert for <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{submittedData.movie}</strong> in {submittedData.city} is on. We'll message you when tickets open.
        </motion.p>

        <motion.button
          type="button"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/dashboard')}
          className="pill-btn pill-btn-primary"
          style={{ width: '100%', maxWidth: 280 }}
        >
          View my alerts
        </motion.button>

        <motion.button
          type="button"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSubmittedData(null)}
          className="pill-btn pill-btn-outline"
          style={{ width: '100%', maxWidth: 280, marginTop: 12 }}
        >
          Create another alert
        </motion.button>
      </div>
    )
  }

  if (activeCount >= MAX_ACTIVE_ALERTS) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100dvh - 200px)', justifyContent: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(232,201,125,0.1)',
            border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', marginBottom: 28,
          }}
        >
          <Bell size={36} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, marginBottom: 12, letterSpacing: 0 }}>
          You have {MAX_ACTIVE_ALERTS} active alerts
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
          You can have up to {MAX_ACTIVE_ALERTS} active alerts at a time. Cancel one you no longer need, or wait for one to go off, then come back to add another.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="pill-btn pill-btn-primary"
          style={{ width: '100%', maxWidth: 280 }}
        >
          View my alerts
        </button>
      </div>
    )
  }

  return (
    <div className="create-alert-page" style={{ width: '100%', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <div className="wizard-layout" style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        <div className="wizard-sidebar" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 8, letterSpacing: 0 }}>
              New alert
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 280 }}>
              Tell us what you want to watch. We'll message you when tickets open.
            </p>
          </div>

          <ol className="desktop-indicator" aria-label="Steps" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36, listStyle: 'none' }}>
            {STEPS.map((s, i) => {
              const clickable = isStepClickable(i)
              const current = step === i
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    disabled={!clickable}
                    aria-current={current ? 'step' : undefined}
                    onClick={() => setStep(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      padding: '6px 8px', margin: '0 -8px', borderRadius: 8,
                      background: 'transparent', border: 'none', textAlign: 'left',
                      opacity: current ? 1 : clickable ? 0.7 : 0.4,
                      transition: 'opacity 0.3s',
                      cursor: clickable ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span aria-hidden="true" style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: current ? 'var(--accent)' : 'var(--bg3)',
                      color: current ? '#000' : 'var(--text2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14,
                    }}>
                      {i + 1}
                    </span>
                    <span>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: current ? 'var(--text)' : 'var(--text2)' }}>{s.title}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text2)' }}>{s.desc}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="mobile-indicator">
            <StepIndicator current={step} total={TOTAL_STEPS} label={STEPS[step].title} />
          </div>
        </div>

        <div className="wizard-form-area" style={{
          flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
          background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
            {step === 0 && <Step0City />}
            {step === 1 && <Step1Movie />}
            {step === 2 && <Step2DateTheatre />}
            {step === 3 && <Step3Filters />}
          </div>

          {submitError && (
            <p role="alert" style={{ fontSize: 13, color: 'var(--red)', padding: '12px 20px 0', margin: 0, lineHeight: 1.5 }}>
              {submitError.message}
              {(submitError.code === 'DUPLICATE_ALERT' || submitError.code === 'ALERT_LIMIT') && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                  >
                    View my alerts
                  </button>
                </>
              )}
            </p>
          )}
          <div className="wizard-actions" style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0,
          }}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => { setSubmitError(null); prevStep() }}
                aria-label="Back to the previous step"
                style={{
                  padding: '0 20px', minHeight: 44, borderRadius: 500,
                  border: '1px solid #7c7c7c', background: 'transparent',
                  color: 'var(--text)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  if (!canNext) {
                    setNudgedStep(step)
                    nudgeMissing()
                    return
                  }
                  if (isLast) handleSubmit()
                  else nextStep()
                }}
                disabled={isSubmitting}
                aria-disabled={!canNext}
                aria-describedby={!canNext ? 'wizard-hint' : undefined}
                style={{
                  padding: '12px', minHeight: 44, borderRadius: 500, border: 'none',
                  background: canNext && !isSubmitting ? 'var(--accent)' : 'var(--bg3)',
                  color: canNext && !isSubmitting ? '#000' : 'var(--text3)',
                  fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {isSubmitting && <span className="spinner" aria-hidden="true" />}
                {isSubmitting ? 'Creating…' : isLast ? 'Create alert' : 'Continue'}
                {!isSubmitting && !isLast && <ArrowRight size={16} aria-hidden="true" />}
              </button>
              {!canNext && (
                <p id="wizard-hint" role={nudgedStep === step ? 'alert' : undefined} style={{ fontSize: 12, color: nudgedStep === step ? 'var(--red)' : 'var(--text2)', fontWeight: nudgedStep === step ? 600 : 400, textAlign: 'center' }}>
                  {nudgedStep === step ? NUDGES[step] : HINTS[step]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .create-alert-page { padding: 12px 0 0; height: calc(100vh - 120px); height: calc(100dvh - 120px); min-height: 520px; }
        .wizard-layout { flex-direction: column; gap: 12px; }
        .wizard-sidebar { padding-bottom: 0; }
        .desktop-indicator { display: none !important; }
        .mobile-indicator { display: block; margin-top: 4px; }
        .wizard-sidebar p { display: none; }
        .wizard-form-area { padding: 0 !important; }

        @media (max-height: 700px) and (max-width: 899px) {
          .create-alert-page { height: auto; min-height: 0; }
          .wizard-form-area, .wizard-form-area > div { flex: none !important; }
          .wizard-form-area .wizard-scroll-area { flex: none !important; overflow-y: visible !important; }
          .wizard-actions { position: sticky; bottom: 0; background: var(--bg2); border-radius: 0 0 8px 8px; z-index: 5; }
        }

        @media (min-width: 900px) {
          .create-alert-page { padding: 20px 0; }
          .wizard-layout { flex-direction: row; gap: 40px; }
          .wizard-sidebar { width: 300px; }
          .wizard-sidebar p { display: block; }
          .desktop-indicator { display: flex !important; }
          .mobile-indicator { display: none; }
        }

        .wizard-scroll-area::-webkit-scrollbar { width: 6px; }
        .wizard-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .wizard-scroll-area::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
      `}</style>
    </div>
  )
}
