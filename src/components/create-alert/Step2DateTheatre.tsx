import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { getAlertDateOptions } from '@/components/ui/dates'
import { getErrorMessage } from '@/api/errors'
import { refreshVenues, getTheatres } from '@/api/cities'
import { TheatreCardSkeleton } from '@/components/ui/Skeleton'
import type { Venue } from '@/types'

const MORE_COMING_MESSAGE = "Still looking for more theatres in this city. Check back in a little while."

export default function Step2DateTheatre() {
  const { formData, updateForm } = useCreateAlertStore()
  const nudge = useCreateAlertStore((s) => s.nudge)
  const seenNudge = useRef(nudge)
  const dateGroupRef = useRef<HTMLDivElement>(null)
  const [highlightDates, setHighlightDates] = useState(false)

  useEffect(() => {
    if (nudge === seenNudge.current) return
    seenNudge.current = nudge
    if (useCreateAlertStore.getState().formData.date) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    dateGroupRef.current?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    setHighlightDates(true)
    const timer = setTimeout(() => setHighlightDates(false), 1600)
    return () => clearTimeout(timer)
  }, [nudge])
  const queryClient = useQueryClient()
  const dates = useMemo(
    () => getAlertDateOptions(formData.movie_release_date),
    [formData.movie_release_date]
  )
  const releasesLater = dates.length > 0 && dates[0].iso === formData.movie_release_date?.slice(0, 10)
  const [venueQuery, setVenueQuery] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [requestMessage, setRequestMessage] = useState('')

  const selectedIds: string[] = formData.theatre_ids ?? []
  const selectedNames: string[] = formData.theatre_names ?? []

  const { data: theatres = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['theatres', formData.city],
    queryFn: () => getTheatres(formData.city || ''),
    enabled: !!formData.city,
  })

  const needle = venueQuery.trim().toLowerCase()
  const filteredTheatres = needle
    ? [
        ...theatres.filter((t) => t.name.toLowerCase().includes(needle)),
        ...theatres.filter((t) => !t.name.toLowerCase().includes(needle) && t.address?.toLowerCase().includes(needle)),
      ]
    : theatres

  const toggleTheatre = (t: Pick<Venue, '_id' | 'name'>) => {
    const index = selectedIds.indexOf(t._id)
    if (index >= 0) {
      updateForm({
        theatre_ids: selectedIds.filter((_, i) => i !== index),
        theatre_names: selectedNames.filter((_, i) => i !== index),
      })
    } else {
      updateForm({ theatre_ids: [...selectedIds, t._id], theatre_names: [...selectedNames, t.name] })
    }
  }

  const handleRefreshTheatres = async () => {
    if (!formData.city) return
    setRequesting(true)
    setRequestStatus('idle')
    try {
      const result = await refreshVenues(formData.city)
      setRequestMessage(
        result.refreshed
          ? result.moreComing
            ? `The theatre list is refreshed. ${MORE_COMING_MESSAGE}`
            : 'The theatre list is refreshed.'
          : "The theatre list is already up to date. Try a different spelling, or check back later."
      )
      setRequestStatus('success')
      await queryClient.invalidateQueries({ queryKey: ['theatres', formData.city] })
    } catch (err) {
      setRequestMessage(getErrorMessage(err, "We couldn't refresh the theatre list. Please try again in a bit."))
      setRequestStatus('error')
    } finally {
      setRequesting(false)
    }
  }

  const showRefresh = !isLoading && !isError && (filteredTheatres.length === 0)

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div style={{ flexShrink: 0, minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Date & theatres</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            {releasesLater
              ? `Pick a date. It releases ${dates[0].day}, ${dates[0].num} ${dates[0].mon}, so dates start there.`
              : 'Pick a date. Choosing theatres is optional.'}
          </p>
        </div>

        <div
          ref={dateGroupRef}
          role="group"
          aria-label="Date"
          className="wizard-scroll-area mask-right"
          style={{
            outline: highlightDates ? '2px solid var(--accent)' : '2px solid transparent',
            outlineOffset: 4,
            borderRadius: 12,
            transition: 'outline-color 0.3s',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 12,
            marginBottom: 16,
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity',
          }}
        >
          {dates.map((d) => {
            const selected = formData.date === d.iso
            return (
              <button
                type="button"
                key={d.iso}
                onClick={() => updateForm({ date: d.iso })}
                aria-pressed={selected}
                aria-label={`${d.day} ${d.num} ${d.mon}`}
                style={{
                  flexShrink: 0,
                  minWidth: 56,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-md)'}`,
                  background: selected ? 'rgba(232,201,125,0.12)' : 'var(--bg3)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  scrollSnapAlign: 'start',
                }}
              >
                <div style={{ fontSize: 10, color: selected ? 'var(--accent)' : 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0 }}>{d.day}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--text)', lineHeight: 1.2 }}>{d.num}</div>
                <div style={{ fontSize: 10, color: selected ? 'var(--accent)' : 'var(--text2)' }}>{d.mon}</div>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div id="theatres-label" style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 600 }}>
            Theatres <span style={{ color: 'var(--text4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional, leave empty for any theatre)</span>
          </div>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span aria-live="polite" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => updateForm({ theatre_ids: [], theatre_names: [] })}
                style={{
                  fontSize: 12,
                  color: 'var(--text2)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 4,
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <input
          type="search"
          aria-label="Search theatres"
          autoComplete="off"
          enterKeyHint="search"
          value={venueQuery}
          onChange={(e) => {
            setVenueQuery(e.target.value)
            setRequestStatus('idle')
          }}
          placeholder="Search theatres or areas…"
          style={{
            background: 'var(--bg3)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: 500,
            padding: '10px 16px',
            minHeight: 44,
            width: '100%',
            marginBottom: 12,
            boxShadow: 'none',
          }}
        />

        {selectedIds.length > 0 && (
          <ul aria-label="Selected theatres" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, paddingBottom: 4, listStyle: 'none', maxHeight: 88, overflowY: 'auto' }}>
            {selectedNames.map((name, i) => (
              <li
                key={selectedIds[i]}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  padding: '2px 4px 2px 10px',
                  borderRadius: 100,
                  background: 'rgba(232,201,125,0.08)',
                  border: '1px solid rgba(232,201,125,0.3)',
                  color: 'var(--accent)',
                  maxWidth: '100%',
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>
                  {name}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() => toggleTheatre({ _id: selectedIds[i], name })}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--accent)', fontSize: 16, lineHeight: 1, padding: '4px 6px',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="wizard-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div role="status" aria-label="Loading theatres" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <TheatreCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--text2)' }}>
            We couldn't load theatres.{' '}
            <button type="button" onClick={() => refetch()} style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              Try again
            </button>
          </div>
        ) : (
          <ul aria-labelledby="theatres-label" style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
            {filteredTheatres.map((t) => {
              const selected = selectedIds.includes(t._id)
              return (
                <li key={t._id}>
                  <button
                    type="button"
                    onClick={() => toggleTheatre(t)}
                    aria-pressed={selected}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      minHeight: 48,
                      borderRadius: 12,
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'rgba(232,201,125,0.06)' : 'var(--bg3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                  >
                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{t.name}</div>
                      {t.address && (
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.address}</div>
                      )}
                    </div>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-md)'}`,
                        background: selected ? 'var(--accent)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                      }}
                    >
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="var(--accent-contrast)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {showRefresh && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p role="status" style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
              {needle
                ? `No theatres match "${venueQuery.trim()}".`
                : "We're still loading theatres for this city. Try again in a few minutes, or leave this empty to include every theatre."}
            </p>

            {requestStatus === 'success' ? (
              <div
                role="status"
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(65,214,166,0.08)',
                  border: '1px solid rgba(65,214,166,0.25)',
                  fontSize: 13, color: 'var(--green)', lineHeight: 1.6,
                }}
              >
                {requestMessage}
              </div>
            ) : requestStatus === 'error' ? (
              <div
                role="alert"
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(255,107,107,0.08)',
                  border: '1px solid rgba(255,107,107,0.25)',
                  fontSize: 13, color: 'var(--red)', lineHeight: 1.6, marginBottom: 12,
                }}
              >
                {requestMessage}
              </div>
            ) : null}

            {requestStatus !== 'success' && (
              <button
                type="button"
                onClick={handleRefreshTheatres}
                disabled={requesting}
                aria-busy={requesting}
                style={{
                  padding: '12px 20px', minHeight: 44, borderRadius: 10,
                  border: '1px solid var(--accent)',
                  background: requesting ? 'var(--bg4)' : 'rgba(232,201,125,0.08)',
                  color: 'var(--accent)', fontSize: 13, fontWeight: 600,
                  cursor: requesting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                {requesting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Refreshing…
                  </>
                ) : (
                  <>Refresh theatre list</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
