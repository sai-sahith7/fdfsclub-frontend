import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { Tag } from '@/components/ui/Badge'
import { MovieCardSkeleton } from '@/components/ui/Skeleton'
import { requestMovie } from '@/api/movies'
import { useMovieSearch } from '@/hooks/useMovieSearch'
import { Film, Search, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Movie } from '@/types'
import { getErrorMessage } from '@/api/errors'
import { formatReleaseLabel } from '@/components/ui/dates'

export default function Step1Movie() {
  const queryClient = useQueryClient()
  const { formData, updateForm } = useCreateAlertStore()
  const [requesting, setRequesting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [requestMessage, setRequestMessage] = useState('')
  const { query, setQuery, data: movies = [], isLoading, isFetching, isError, total, page, totalPages, setPage } = useMovieSearch()

  const selectMovie = (m: Movie) => {
    updateForm({
      movie_name: m.name,
      movie_id: String(m.contentId),
      movie_poster: m.image_url,
      movie_release_date: m.release_date ?? null,
      available_formats: m.screen_formats || [],
      available_languages: m.languages || [],
      date: '',
      formats: [],
      languages: [],
    })
  }

  const handleRequestMovie = async () => {
    if (!query.trim() || !formData.city) return
    setRequesting(true)
    setRequestStatus('idle')
    try {
      const result = await requestMovie(formData.city_name || formData.city, query.trim())
      setRequestMessage(result.message)
      setRequestStatus('success')
      await queryClient.invalidateQueries({ queryKey: ['movies'] })
    } catch (err) {
      setRequestMessage(getErrorMessage(err, "We couldn't search right now. Please try again in a bit."))
      setRequestStatus('error')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div style={{ flexShrink: 0, minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Pick a movie</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Pick from the list, or search by name.
          </p>
        </div>

        <input
          type="search"
          aria-label="Search movies"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setRequestStatus('idle') }}
          placeholder="Search movies…"
          style={{
            background: 'var(--bg3)', color: 'var(--text)',
            border: 'none', borderRadius: 500,
            padding: '10px 16px', minHeight: 44,
            width: '100%', fontFamily: 'var(--font-body)',
            marginBottom: 14, boxShadow: 'none',
          }}
        />
      </div>

      <div className="wizard-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column' }}>
        {formData.movie_id && formData.movie_name && (
          <section aria-label="Selected movie" style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg2)', paddingBottom: 10, marginBottom: 6, borderBottom: '1px solid var(--border)' }}>
            <div aria-hidden="true" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Selected</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 6, background: 'rgba(232,201,125,0.1)', outline: '1px solid var(--accent)' }}>
              <div style={{ width: 28, height: 38, borderRadius: 3, flexShrink: 0, background: 'var(--bg4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.movie_poster ? <img src={formData.movie_poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Film size={14} color="var(--text3)" aria-hidden="true" />}
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.movie_name}</div>
              <Check size={16} color="var(--accent)" aria-hidden="true" />
            </div>
          </section>
        )}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {isError && movies.length === 0 && (
              <p role="alert" style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', padding: '20px 0' }}>
                We couldn't load movies. Check your connection and try again.
              </p>
            )}

            {!isError && movies.length === 0 && !query.trim() && (
              <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
                No movies to show yet. Search for one by name.
              </p>
            )}

            {movies.length === 0 && query.trim() && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p role="status" style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                  No movies match "{query}"
                </p>

                {requestStatus === 'success' ? (
                  <div role="status" style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(232,201,125,0.08)', fontSize: 13,
                    color: 'var(--accent)', lineHeight: 1.6,
                  }}>
                    {requestMessage || "We couldn't find that movie yet. Try a different spelling."}
                  </div>
                ) : requestStatus === 'error' ? (
                  <div role="alert" style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(243,114,127,0.08)', fontSize: 13,
                    color: 'var(--red)', lineHeight: 1.6, marginBottom: 12,
                  }}>
                    {requestMessage}
                  </div>
                ) : null}

                {requestStatus !== 'success' && (
                  <button
                    type="button"
                    onClick={handleRequestMovie}
                    disabled={requesting}
                    aria-busy={requesting}
                    style={{
                      padding: '10px 20px', minHeight: 44, borderRadius: 500,
                      border: '1px solid var(--accent)',
                      background: requesting ? 'var(--bg3)' : 'rgba(232,201,125,0.08)',
                      color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                      cursor: requesting ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}
                  >
                    {requesting ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Searching…
                      </>
                    ) : (
                      <><Search size={14} aria-hidden="true" /> Search all movies</>
                    )}
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
              {isFetching && !isLoading && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 2, borderRadius: 1,
                  background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1s infinite',
                  zIndex: 10,
                }} />
              )}
              {movies.map((m) => {
                const selected = formData.movie_id === String(m.contentId)
                const releaseLabel = formatReleaseLabel(m.release_date)
                return (
                  <button
                    type="button"
                    key={m.contentId}
                    onClick={() => selectMovie(m)}
                    aria-pressed={selected}
                    style={{
                      display: 'flex', gap: 12, padding: 12, borderRadius: 6,
                      border: 'none',
                      background: selected ? 'rgba(232,201,125,0.1)' : 'var(--bg3)',
                      outline: selected ? '1px solid var(--accent)' : 'none',
                      cursor: 'pointer', textAlign: 'left', alignItems: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 42, height: 56, borderRadius: 4, flexShrink: 0,
                      background: 'var(--bg4)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {m.image_url ? <img src={m.image_url} alt="" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Film size={18} color="var(--text3)" aria-hidden="true" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: selected ? 700 : 600, color: selected ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>
                        {m.name}
                      </div>
                      {(m.censor || releaseLabel) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                          {m.censor && <Tag>{m.censor}</Tag>}
                          {releaseLabel && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{releaseLabel}</span>}
                        </div>
                      )}
                    </div>
                    {selected && <Check size={18} color="var(--accent)" style={{ flexShrink: 0 }} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>

            {total > 0 && totalPages > 1 && (
              <nav aria-label="Movie pages" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, marginTop: 12, paddingBottom: 8,
              }}>
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  style={{
                    background: 'transparent', border: 'none', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    color: page <= 1 ? 'var(--text3)' : 'var(--accent)', padding: 10,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <span aria-live="polite" style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  style={{
                    background: 'transparent', border: 'none', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    color: page >= totalPages ? 'var(--text3)' : 'var(--accent)', padding: 10,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}