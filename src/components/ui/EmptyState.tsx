import Button from './Button'
import { Bell } from 'lucide-react'

interface EmptyStateProps {
  title: string
  subtitle: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '48px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div aria-hidden="true" style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, color: 'var(--text3)',
      }}>
        <Bell size={28} />
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 320, marginBottom: action ? 28 : 0 }}>
        {subtitle}
      </p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
