import { useEffect } from 'react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDone: () => void
  duration?: number
}

export default function UndoToast({ message, onUndo, onDone, duration = 5000 }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [onDone, duration])

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 16, right: 16, bottom: 'calc(24px + env(safe-area-inset-bottom))', zIndex: 150,
        maxWidth: 420, margin: '0 auto', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 16px', borderRadius: 10,
        background: 'var(--bg3)', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-heavy)',
        fontSize: 14, color: 'var(--text)', animation: 'toastIn 0.2s ease',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onUndo}
        style={{
          padding: '8px 14px', minHeight: 36, borderRadius: 500, border: 'none',
          background: 'transparent', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        Undo
      </button>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', left: 0, bottom: 0, height: 2, width: '100%', background: 'var(--accent)',
          transformOrigin: 'left', animation: `undoCountdown ${duration}ms linear forwards`,
        }}
      />
      <style>{'@keyframes undoCountdown { from { transform: scaleX(1); } to { transform: scaleX(0); } } @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }'}</style>
    </div>
  )
}
