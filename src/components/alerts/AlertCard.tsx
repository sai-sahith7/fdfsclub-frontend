import { useId, useState } from 'react'
import { StatusBadge, Tag } from '@/components/ui/Badge'
import { formatDate, formatRelative } from '@/components/ui/dates'
import { MapPin, Calendar, Building2, Clock, Banknote, CalendarPlus, Search, Film } from 'lucide-react'
import type { Alert } from '@/types'

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

interface AlertCardProps {
  alert: Alert
  onCancel?: (id: string) => void
  cancelling?: boolean
}

export default function AlertCard({ alert, onCancel, cancelling = false }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const isActive = alert.status === 'ACTIVE'
  const isDone = !isActive
  const venues = alert.venues ?? []
  const hasTime = alert.filters.show_time_min != null || alert.filters.show_time_max != null
  const hasPrice = alert.filters.price_min != null || alert.filters.price_max != null

  return (
    <article
      aria-label={`${alert.movie.name}, ${alert.city.name}, ${formatDate(alert.alert_date)}`}
      className="alert-card"
      style={{
        background: 'var(--bg2)',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.2s',
        opacity: cancelling ? 0.5 : 1,
      }}
    >
      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: -1, borderRadius: 9,
            border: '1px solid rgba(232,201,125,0.15)',
            animation: 'ringPulse 2.5s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 14, padding: '14px 16px 12px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 48, height: 66, borderRadius: 6,
            background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
            filter: isDone ? 'grayscale(0.7)' : undefined,
            opacity: isDone ? 0.7 : 1,
          }}
        >
          {alert.movie?.image_url ? (
            <img src={alert.movie.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Film size={20} color="var(--text3)" aria-hidden="true" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, fontFamily: 'var(--font-display)', minWidth: 0, overflowWrap: 'anywhere', color: isDone ? 'var(--text2)' : 'var(--text)' }}>
              {alert.movie.name}
            </h3>
            <StatusBadge status={alert.status} showPulse />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginBottom: 8 }}>
            <MetaItem icon={<MapPin size={10} />}>{alert.city.name}</MetaItem>
            <MetaItem icon={<Calendar size={10} />}>{formatDate(alert.alert_date)}</MetaItem>
            <MetaItem icon={<Building2 size={10} />}>
              {venues.length === 0
                ? 'Any theatre'
                : venues.length === 1
                  ? venues[0].name ?? '1 theatre'
                  : `${venues[0].name ?? 'Theatre'} +${venues.length - 1} more`}
            </MetaItem>
          </div>

          {(alert.filters.formats.length > 0 || alert.filters.languages.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {alert.filters.formats.map((f) => (
                <Tag key={f} variant="accent">{f}</Tag>
              ))}
              {alert.filters.languages.map((l) => (
                <Tag key={l}>{l}</Tag>
              ))}
            </div>
          )}

          {alert.notified_at && alert.status === 'ALERTED' && (
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              Sent {formatRelative(alert.notified_at)}
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div id={detailsId} style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {venues.length > 1 && (
            <MetaItem icon={<Building2 size={10} />}>{venues.map((venue) => venue.name).filter(Boolean).join(', ')}</MetaItem>
          )}
          <MetaItem icon={<Clock size={10} />}>
            {hasTime
              ? `${formatTime(alert.filters.show_time_min ?? 0)} - ${alert.filters.show_time_max != null ? formatTime(alert.filters.show_time_max) : 'late night'}`
              : 'Any show time'}
          </MetaItem>
          <MetaItem icon={<Banknote size={10} />}>
            {hasPrice
              ? alert.filters.price_max != null
                ? `₹${alert.filters.price_min ?? 0} - ₹${alert.filters.price_max}`
                : `From ₹${alert.filters.price_min ?? 0}`
              : 'Any price'}
          </MetaItem>
          <MetaItem icon={<CalendarPlus size={10} />}>Created {formatRelative(alert.created_at)}</MetaItem>
          {isActive && alert.last_checked_at && (
            <MetaItem icon={<Search size={10} />}>Last checked {formatRelative(alert.last_checked_at)}</MetaItem>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="card-btn"
          style={{
            padding: '6px 12px', minHeight: 32, borderRadius: 500,
            border: '1px solid var(--border-md)', background: 'transparent',
            color: 'var(--text2)', fontSize: 11, cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 600,
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}
        >
          {expanded ? 'Hide details' : 'Details'}
        </button>

        <div style={{ marginLeft: 'auto' }} />

        {isActive && onCancel && (
          <button
            type="button"
            className="card-cancel"
            disabled={cancelling}
            onClick={() => onCancel(alert._id)}
            style={{
              padding: '6px 10px', minHeight: 32, borderRadius: 500,
              border: 'none', background: 'transparent',
              color: 'var(--text3)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 500,
            }}
          >
            {cancelling ? 'Cancelling…' : 'Cancel alert'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes ringPulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.03); }
        }
        @media (hover: hover) {
          .alert-card:hover { background: var(--bg3) !important; }
          .card-cancel:hover { color: var(--red) !important; }
        }
      `}</style>
    </article>
  )
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text2)', minWidth: 0 }}>
      <span aria-hidden="true" style={{ color: 'var(--text3)', flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
    </span>
  )
}
