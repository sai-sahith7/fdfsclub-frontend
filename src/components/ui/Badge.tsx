import { cn } from '@/components/ui/cn'
import type { AlertStatus } from '@/types'

const STATUS_STYLES: Record<AlertStatus, { bg: string; color: string; label: string }> = {
  ACTIVE:    { bg: 'rgba(65,214,166,0.12)',  color: 'var(--green)',  label: 'Active' },
  ALERTED:   { bg: 'rgba(83,157,245,0.15)',  color: 'var(--blue)',   label: 'Sent' },
  CANCELLED: { bg: 'rgba(255,255,255,0.08)', color: 'var(--text2)',  label: 'Cancelled' },
  EXPIRED:   { bg: 'rgba(255,255,255,0.08)', color: 'var(--text2)',  label: 'Expired' },
}

interface StatusBadgeProps {
  status: AlertStatus
  showPulse?: boolean
}

export function StatusBadge({ status, showPulse }: StatusBadgeProps) {
  const s = STATUS_STYLES[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        padding: '3px 10px',
        borderRadius: 9999,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {showPulse && status === 'ACTIVE' && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--green)',
            animation: 'blink 1.2s infinite',
            flexShrink: 0,
          }}
        />
      )}
      {s.label}
    </span>
  )
}

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'accent'
  className?: string
}

export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span
      className={cn(className)}
      style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 4,
        background: variant === 'accent' ? 'rgba(232,201,125,0.1)' : 'var(--bg4)',
        border: 'none',
        color: variant === 'accent' ? 'var(--accent)' : 'var(--text2)',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}
