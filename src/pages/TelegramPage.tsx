import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { verifyTelegramCode, disconnectTelegram } from '@/api/telegram'
import { extractOtpDigits, fillOtpDigits } from '@/components/ui/otp'
import { getErrorMessage } from '@/api/errors'
import { takePendingTelegramCode } from '@/store/session'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

const CODE_LENGTH = 6
const BOT_USERNAME = 'FDFSClubBot'

export default function TelegramPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [connected, setConnected] = useState(user?.telegram?.connected ?? false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const verifyingRef = useRef(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const connectedHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (connected) connectedHeadingRef.current?.focus()
  }, [connected])

  useEffect(() => {
    if (!isLoggedIn) navigate('/')
  }, [isLoggedIn, navigate])

  const handleVerify = useCallback(async (codeStr: string) => {
    if (codeStr.length < CODE_LENGTH) { setError(`Enter all ${CODE_LENGTH} digits`); return }
    if (verifyingRef.current) return
    verifyingRef.current = true
    setError('')
    setLoading(true)
    try {
      await verifyTelegramCode(codeStr)
      setConnected(true)
      if (refreshUser) await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't connect Telegram. Please try again."))
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      verifyingRef.current = false
      setLoading(false)
    }
  }, [refreshUser])

  const linkCodeHandled = useRef(false)

  useEffect(() => {
    if (linkCodeHandled.current) return
    linkCodeHandled.current = true
    const pendingCode = takePendingTelegramCode()
    if (connected) return
    const code = extractOtpDigits(searchParams.get('code') || pendingCode, CODE_LENGTH)
    if (code.length !== CODE_LENGTH) return

    setDigits(code.split(''))
    searchParams.delete('code')
    setSearchParams(searchParams, { replace: true })
    handleVerify(code)
  }, [connected, searchParams, setSearchParams, handleVerify])

  const applyDigits = (next: string[], focusIndex: number) => {
    setDigits(next)
    setError('')
    inputRefs.current[Math.min(focusIndex, CODE_LENGTH - 1)]?.focus()
    if (next.every((d) => d !== '')) handleVerify(next.join(''))
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digitsOnly = extractOtpDigits(value, CODE_LENGTH)
      if (!digitsOnly) return
      const startIndex = digitsOnly.length === CODE_LENGTH ? 0 : index
      const next = fillOtpDigits(digits, digitsOnly, startIndex)
      applyDigits(next, startIndex + digitsOnly.length)
      return
    }

    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value
    applyDigits(next, value !== '' ? index + 1 : index)
  }

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = extractOtpDigits(e.clipboardData.getData('text'), CODE_LENGTH)
    if (!pasted) return
    const startIndex = pasted.length === CODE_LENGTH ? 0 : index
    applyDigits(fillOtpDigits(digits, pasted, startIndex), startIndex + pasted.length)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    setError('')
    try {
      await disconnectTelegram()
      setConnected(false)
      setConfirmDisconnect(false)
      setDigits(Array(CODE_LENGTH).fill(''))
      if (refreshUser) await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't disconnect Telegram. Please try again."))
    } finally {
      setDisconnecting(false)
    }
  }

  if (!isLoggedIn) return null

  const allFilled = digits.every((d) => d !== '')

  if (connected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ padding: '20px 0', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div aria-hidden="true" style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(232,201,125,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', margin: '0 auto 20px',
          }}>
            <Send size={28} />
          </div>
          <h1 ref={connectedHeadingRef} tabIndex={-1} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, marginBottom: 8, letterSpacing: 0, outline: 'none' }}>Telegram connected</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
            Your alerts will arrive on Telegram as well as by email.
          </p>
        </div>

        <div style={{ background: 'var(--bg2)', padding: 28, borderRadius: 8, textAlign: 'center', marginBottom: 24 }}>
          <CheckCircle2 size={40} color="var(--accent)" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Linked to</div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 500, maxWidth: '100%',
            background: 'rgba(232,201,125,0.1)',
            fontSize: 13, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.5px',
            overflowWrap: 'anywhere',
          }}>
            <Send size={13} aria-hidden="true" /> {user?.telegram?.username ? `@${user.telegram.username}` : 'your Telegram account'}
          </span>
        </div>

        {error && (
          <p role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>
            <AlertCircle size={14} aria-hidden="true" /> {error}
          </p>
        )}

        {confirmDisconnect ? (
          <div role="group" aria-label="Confirm disconnecting Telegram" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
              Stop sending alerts to Telegram? You'll still get them by email.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setConfirmDisconnect(false)}
                className="pill-btn pill-btn-outline"
                style={{ flex: 1 }}
              >
                Keep it
              </button>
              <button
                type="button"
                autoFocus
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="pill-btn"
                style={{ flex: 1, border: '1px solid rgba(243, 114, 127, 0.4)', background: 'rgba(243,114,127,0.08)', color: 'var(--red)' }}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDisconnect(true)}
            className="pill-btn"
            style={{
              width: '100%', border: '1px solid rgba(243, 114, 127, 0.3)', background: 'transparent',
              color: 'var(--red)',
            }}
          >
            Disconnect Telegram
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ padding: '20px 0', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div aria-hidden="true" style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(232,201,125,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', margin: '0 auto 20px',
        }}>
          <Send size={28} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, marginBottom: 8, letterSpacing: 0 }}>Connect Telegram</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>
          Get your alerts as a Telegram message, usually faster than email.
        </p>
      </div>

      <ol style={{ background: 'var(--bg2)', padding: '4px 20px', borderRadius: 8, marginBottom: 24, listStyle: 'none' }}>
        {[
          { n: '1', title: 'Open the bot', desc: `Tap the button below to open @${BOT_USERNAME} in Telegram` },
          { n: '2', title: 'Get your code', desc: 'Send /start and the bot replies with a 6-digit code' },
          { n: '3', title: 'Connect', desc: 'Tap the link in that message, or type the code below' },
        ].map((s, i, arr) => (
          <li key={s.n} style={{
            display: 'flex', gap: 16, padding: '16px 0',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div aria-hidden="true" style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)',
              color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {s.n}
            </div>
            <div>
              <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </li>
        ))}
      </ol>

      <a
        href={`https://t.me/${BOT_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pill-btn"
        style={{
          display: 'flex', width: '100%',
          background: 'rgba(232,201,125,0.1)', color: 'var(--accent)',
          textDecoration: 'none', marginBottom: 32,
        }}
      >
        Open Telegram
      </a>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ width: '100%', fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, textAlign: 'center', fontWeight: 600 }}>
          Your 6-digit code
        </legend>

        <div className="otp-row" style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
              aria-invalid={Boolean(error)}
              value={digit}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.target.select()}
              maxLength={CODE_LENGTH}
              style={{
                width: '100%', maxWidth: 56, minWidth: 0, height: 60, borderRadius: 8,
                border: 'none', padding: 0,
                outline: digit ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.12)',
                background: digit ? 'rgba(232,201,125,0.05)' : 'var(--bg3)',
                textAlign: 'center', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700,
                color: 'var(--text)', transition: 'all 0.15s', boxShadow: 'none',
              }}
            />
          ))}
        </div>
      </fieldset>

      <div aria-live="assertive">
        {error && (
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}>
            <AlertCircle size={14} aria-hidden="true" style={{ flexShrink: 0 }} /> {error}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => handleVerify(digits.join(''))}
        disabled={loading || !allFilled}
        className="pill-btn"
        style={{
          width: '100%', marginTop: 12,
          background: allFilled && !loading ? 'var(--accent)' : 'var(--bg3)',
          color: allFilled && !loading ? '#000' : 'var(--text3)',
        }}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {loading ? 'Connecting…' : 'Connect'}
      </button>

      <style>{`
        @media (max-width: 360px) {
          .otp-row { gap: 6px !important; }
          .otp-row input { height: 52px !important; font-size: 20px !important; }
        }
      `}</style>
    </motion.div>
  )
}
