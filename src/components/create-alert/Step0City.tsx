import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { useAuthStore } from '@/store/authStore'
import { getCities } from '@/api/cities'
import { resolveLocation } from '@/api/user'
import { CityCardSkeleton } from '@/components/ui/Skeleton'
import { MapPin, Star } from 'lucide-react'
import { getErrorMessage } from '@/api/errors'

const MAX_VISIBLE = 10

export default function Step0City() {
  const { formData, updateForm } = useCreateAlertStore()
  const favouriteCity = useAuthStore((s) => s.user?.favourite_city)
  const favouriteSlug = favouriteCity?.slug ?? null
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [sortCity, setSortCity] = useState(formData.city)

  useEffect(() => {
    if (formData.city !== sortCity) {
      const timer = setTimeout(() => { setSortCity(formData.city) }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.city, sortCity])

  const { data: cities = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  })

  useEffect(() => {
    if (formData.city || !favouriteSlug || cities.length === 0) return
    const favourite = cities.find((c) => c.slug === favouriteSlug)
    if (favourite) updateForm({ city: favourite.slug, city_name: favourite.name })
  }, [cities, favouriteSlug, formData.city, updateForm])

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.slug === sortCity) return -1
    if (b.slug === sortCity) return 1
    if (a.slug === favouriteSlug) return -1
    if (b.slug === favouriteSlug) return 1
    return 0
  })
  const visible = sortedFiltered.slice(0, MAX_VISIBLE)
  const hiddenCount = filtered.length - visible.length

  const handleCitySelect = (city: { slug: string; name: string }) => {
    if (city.slug === formData.city) return
    updateForm({ city: city.slug, city_name: city.name, theatre_ids: [], theatre_names: [] })
  }

  const handleGPS = () => {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError("Your browser can't share your location. Please pick your city from the list.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { city } = await resolveLocation(coords.latitude, coords.longitude)
          handleCitySelect(city)
          setQuery('')
          queryClient.invalidateQueries({ queryKey: ['cities'] })
        } catch (err) {
          setLocationError(getErrorMessage(err, "We couldn't find your city. Please pick it from the list."))
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        setLocationError('Location access was denied. Please pick your city from the list.')
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div style={{ flexShrink: 0, minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Choose your city</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Where do you want to watch?</p>
        </div>

        <input
          type="search"
          aria-label="Search cities"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities…"
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
        <div className="city-grid" style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
          {isLoading ? (
            <div style={{ display: 'grid', gap: 6 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <CityCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            visible.map((city) => {
              const selected = formData.city === city.slug
              return (
                <button
                  type="button"
                  key={city._id || city.slug || city.name}
                  onClick={() => handleCitySelect(city)}
                  aria-pressed={selected}
                  style={{
                    padding: '11px 14px', minHeight: 44, borderRadius: 6,
                    border: 'none',
                    background: selected ? 'rgba(232,201,125,0.12)' : 'var(--bg3)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                    outline: selected ? '1px solid var(--accent)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {city.slug === favouriteSlug && (
                      <Star size={12} fill="var(--accent)" color="var(--accent)" style={{ flexShrink: 0 }} aria-label="Favourite city" />
                    )}
                    <div style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? 'var(--accent)' : 'var(--text)' }}>{city.name}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {filtered.length > 0 && !isLoading && (
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginBottom: 12 }}>
            {hiddenCount > 0
              ? <>Showing {visible.length} of {filtered.length.toLocaleString('en-IN')} cities · Type to search for more</>
              : `${filtered.length} ${filtered.length === 1 ? 'city' : 'cities'}`}
          </div>
        )}

        {filtered.length === 0 && query.trim() && !isLoading && (
          <p role="status" style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
            No cities match "{query}". Try another spelling, or use your location below.
          </p>
        )}

        {isError && !isLoading && cities.length === 0 && (
          <div role="alert" style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', padding: '12px 0' }}>
            We couldn't load cities.{' '}
            <button type="button" onClick={() => refetch()} style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              Try again
            </button>
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            onClick={handleGPS}
            disabled={locating}
            aria-busy={locating}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: 12, borderRadius: 8,
              border: 'none', background: 'var(--bg3)',
              cursor: locating ? 'wait' : 'pointer', transition: 'all 0.15s',
            }}
          >
            <div aria-hidden="true" style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--bg4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: 'var(--accent)',
            }}>
              <MapPin size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {locating ? 'Finding your city…' : 'Use my location'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>We'll pick the city you're in</div>
            </div>
          </button>
          {locationError && (
            <p role="alert" style={{ fontSize: 12, color: 'var(--red)', marginTop: 8, textAlign: 'center' }}>
              {locationError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}