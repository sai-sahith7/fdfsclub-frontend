import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  failed: boolean
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center', background: 'var(--bg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 360, lineHeight: 1.6 }}>
          This page didn't load properly. Reloading usually fixes it.
        </p>
        <button type="button" className="pill-btn pill-btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    )
  }
}
