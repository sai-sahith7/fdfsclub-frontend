import { useGoogleTokenExchange } from '@/hooks/useAuth'
import { useAuthModalStore } from '@/store/authModalStore'
import { useNavigate } from 'react-router-dom'

export default function GoogleTokenPage() {
  const error = useGoogleTokenExchange()
  const openAuth = useAuthModalStore((s) => s.open)
  const navigate = useNavigate()

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      {error ? (
        <>
          <p role="alert" style={{ fontSize: 15, color: 'var(--text)' }}>{error}</p>
          <button
            className="pill-btn pill-btn-primary"
            onClick={() => { navigate('/', { replace: true }); openAuth() }}
          >
            Try again
          </button>
        </>
      ) : (
        <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span className="spinner" aria-hidden="true" />
          <span style={{ fontSize: 15, color: 'var(--text2)' }}>Signing you in…</span>
        </div>
      )}
    </main>
  )
}
