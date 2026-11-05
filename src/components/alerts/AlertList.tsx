import AlertCard from './AlertCard'
import { AlertCardSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Alert } from '@/types'

interface AlertListProps {
  alerts: Alert[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  onCancel?: (id: string) => void
  cancellingId?: string | null
  emptyTitle?: string
  emptySubtitle?: string
  emptyAction?: { label: string; onClick: () => void }
}

export default function AlertList({
  alerts,
  loading,
  error,
  onRetry,
  onCancel,
  cancellingId = null,
  emptyTitle = 'No alerts yet',
  emptySubtitle = 'Create your first alert and we’ll message you when tickets open.',
  emptyAction,
}: AlertListProps) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading your alerts" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AlertCardSkeleton />
        <AlertCardSkeleton />
        <AlertCardSkeleton />
      </div>
    )
  }

  if (error && alerts.length === 0) {
    return (
      <EmptyState
        title="We couldn't load your alerts"
        subtitle="Check your connection and try again."
        action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
      />
    )
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
        action={emptyAction}
      />
    )
  }

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
      {alerts.map((alert) => (
        <li key={alert._id}>
          <AlertCard alert={alert} onCancel={onCancel} cancelling={cancellingId === alert._id} />
        </li>
      ))}
    </ul>
  )
}
