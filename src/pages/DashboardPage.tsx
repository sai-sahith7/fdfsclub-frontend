import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AlertList from '@/components/alerts/AlertList'
import { useAlerts, useCancelAlert, useHistoryAlerts, useRestoreAlert } from '@/hooks/useAlerts'
import UndoToast from '@/components/ui/UndoToast'
import { getErrorMessage } from '@/api/errors'
import { MAX_ACTIVE_ALERTS } from '@/api/alerts'
import { motion } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

type Tab = 'active' | 'history'

function istGreeting(): string {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(new Date()))
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('active')
  const [historyPage, setHistoryPage] = useState(1)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: alerts = [], isLoading, isError, refetch } = useAlerts()
  const { mutate: cancelAlert, variables: cancellingId, isPending: isCancelling } = useCancelAlert()
  const { mutate: restoreAlert } = useRestoreAlert()
  const [cancelError, setCancelError] = useState('')
  const [undoAlert, setUndoAlert] = useState<{ id: string; name: string } | null>(null)
  const clearUndo = useCallback(() => setUndoAlert(null), [])
  const history = useHistoryAlerts(historyPage)

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE')
  const atLimit = activeAlerts.length >= MAX_ACTIVE_ALERTS
  const historyAlerts = history.data?.alerts ?? []
  const pagination = history.data?.pagination

  const firstName = user?.name?.split(' ')[0] || 'there'

  const tabs: { key: Tab; label: string; count: string }[] = [
    { key: 'active', label: 'Active', count: isLoading ? '' : `${activeAlerts.length}/${MAX_ACTIVE_ALERTS}` },
    { key: 'history', label: 'Past', count: pagination ? String(pagination.total) : '' },
  ]

  const pageButtonStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: 8,
    border: '1px solid var(--border-md)', background: 'var(--bg2)',
    color: disabled ? 'var(--text3)' : 'var(--accent)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ padding: '20px 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>
            {istGreeting()}, {firstName}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: 0 }}>
            Your alerts
          </h1>
        </div>
        {(isLoading || activeAlerts.length > 0) && <button
          type="button"
          className="pill-btn pill-btn-primary dashboard-new"
          onClick={() => navigate('/create')}
          disabled={atLimit}
          aria-describedby={atLimit ? 'alert-limit-note' : undefined}
          style={atLimit ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <Plus size={16} aria-hidden="true" /> New alert
        </button>}
      </div>

      <div role="tablist" aria-label="Alerts" style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 500, padding: 4, marginBottom: 24 }}>
        {tabs.map(({ key, label, count }) => {
          const selected = tab === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={selected}
              aria-controls={`panel-${key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setTab(key)
                if (key === 'history') setHistoryPage(1)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const next = key === 'active' ? 'history' : 'active'
                  setTab(next)
                  document.getElementById(`tab-${next}`)?.focus()
                }
              }}
              style={{
                flex: 1, padding: '10px 0', minHeight: 40, borderRadius: 500, fontSize: 13, fontWeight: 700,
                textAlign: 'center', cursor: 'pointer', border: 'none',
                background: selected ? 'var(--accent)' : 'transparent',
                color: selected ? '#000' : 'var(--text2)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase', letterSpacing: '1px',
                fontFamily: 'var(--font-body)',
              }}
            >
              {label}
              {count && <span style={{ marginLeft: 6, fontWeight: 600, opacity: 0.75 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'active' ? (
        <section role="tabpanel" id="panel-active" aria-labelledby="tab-active">
          {cancelError && (
            <p role="alert" style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{cancelError}</p>
          )}
          <AlertList
            alerts={activeAlerts}
            loading={isLoading}
            error={isError}
            onRetry={() => refetch()}
            cancellingId={isCancelling ? cancellingId ?? null : null}
            onCancel={(id) => {
              setCancelError('')
              const name = activeAlerts.find((a) => a._id === id)?.movie.name ?? 'Alert'
              cancelAlert(id, {
                onSuccess: () => setUndoAlert({ id, name }),
                onError: (err) =>
                  setCancelError(getErrorMessage(err, "We couldn't cancel that alert. Please try again.")),
              })
            }}
            emptyTitle="No active alerts"
            emptySubtitle="Pick a movie and a date, and we'll message you when tickets open."
            emptyAction={{ label: 'Create an alert', onClick: () => navigate('/create') }}
          />
          {atLimit && (
            <p id="alert-limit-note" style={{ marginTop: 16, padding: '14px 16px', borderRadius: 8, background: 'var(--bg2)', color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
              You can have up to {MAX_ACTIVE_ALERTS} active alerts at a time. Cancel one to add another.
            </p>
          )}
        </section>
      ) : (
        <section role="tabpanel" id="panel-history" aria-labelledby="tab-history">
          <AlertList
            alerts={historyAlerts}
            loading={history.isLoading}
            error={history.isError}
            onRetry={() => history.refetch()}
            emptyTitle="No past alerts yet"
            emptySubtitle="Alerts that were sent, cancelled or expired will show up here."
          />
          {pagination && pagination.total_pages > 1 && (
            <nav aria-label="Past alert pages" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, marginTop: 24, paddingTop: 16,
              borderTop: '1px solid var(--bg2)',
            }}>
              <button
                type="button"
                aria-label="Previous page"
                disabled={historyPage <= 1 || history.isFetching}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                style={pageButtonStyle(historyPage <= 1)}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>

              <span aria-live="polite" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.5px' }}>
                Page {historyPage} of {pagination.total_pages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={!pagination.has_more || history.isFetching}
                onClick={() => setHistoryPage((p) => p + 1)}
                style={pageButtonStyle(!pagination.has_more)}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      )}

      {undoAlert && (
        <UndoToast
          key={undoAlert.id}
          message={`${undoAlert.name} alert cancelled`}
          onDone={clearUndo}
          onUndo={() => {
            const { id } = undoAlert
            setUndoAlert(null)
            restoreAlert(id, {
              onError: (err) => setCancelError(getErrorMessage(err, "We couldn't restore that alert.")),
            })
          }}
        />
      )}

      <style>{`
        @media (max-width: 480px) {
          .dashboard-new { width: 100%; }
        }
      `}</style>
    </motion.div>
  )
}
