import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TelegramPreviewSection from '@/components/landing/TelegramPreviewSection'
import FAQSection from '@/components/landing/FAQSection'
import { useAuthModalStore } from '@/store/authModalStore'
import { X } from 'lucide-react'

const NOTICES: Record<string, string> = {
  auth_error: "We couldn't sign you in. Please try again.",
}

export default function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const openAuth = useAuthModalStore((s) => s.open)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (searchParams.has('session_expired')) {
      searchParams.delete('session_expired')
      setSearchParams(searchParams, { replace: true })
      openAuth('expired')
      return
    }
    const key = Object.keys(NOTICES).find((name) => searchParams.has(name))
    if (!key) return
    setNotice(NOTICES[key])
    searchParams.delete(key)
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams, openAuth])

  return (
    <div>
      {notice && (
        <div
          role="alert"
          style={{
            position: 'fixed', top: 72, left: 16, right: 16, zIndex: 150, maxWidth: 480, margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 16px', borderRadius: 10,
            background: 'var(--bg3)', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-heavy)',
            fontSize: 13, color: 'var(--text)',
          }}
        >
          <span style={{ flex: 1 }}>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice('')}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 8, display: 'flex' }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <HeroSection />
      <HowItWorksSection />
      <TelegramPreviewSection />
      <FAQSection />
      <footer style={{ padding: '32px 16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p>FDFSClub isn't affiliated with any ticketing site. We only tell you when tickets open.</p>
        <p style={{ marginTop: 8 }}>
          FDFSClub is open source.{' '}
          <a href="https://github.com/sai-sahith7/fdfsclub-frontend" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text2)', textDecoration: 'underline' }}>
            Contribute on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
