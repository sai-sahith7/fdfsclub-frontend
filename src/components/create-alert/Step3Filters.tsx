import { useQuery } from '@tanstack/react-query'
import { useCreateAlertStore } from '@/store/createAlertStore'
import RangeSlider from '@/components/ui/RangeSlider'
import { FilterChipsSkeleton } from '@/components/ui/Skeleton'
import { getFormats } from '@/api/movies'
import { dedupeIgnoreCase } from '@/components/create-alert/filters'
import { PRICE_RANGE, SHOW_TIME_RANGE } from '@/api/alerts'

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

export default function Step3Filters() {
  const { formData, updateForm } = useCreateAlertStore()

  const movieId = formData.movie_id
  const cityName = formData.city_name
  const { data: movieOptions, isLoading } = useQuery({
    queryKey: ['movie-filters', movieId, cityName],
    queryFn: () => getFormats(movieId as string, cityName),
    enabled: !!movieId,
  })

  const formatOptions = dedupeIgnoreCase(movieOptions?.formats ?? formData.available_formats)
  const languageOptions = dedupeIgnoreCase(movieOptions?.languages ?? formData.available_languages)

  const CHIP_GROUPS = [
    {
      key: 'formats' as const,
      label: 'Format',
      options: formatOptions,
    },
    {
      key: 'languages' as const,
      label: 'Language',
      options: languageOptions,
    },
  ]

  const toggle = (key: 'formats' | 'languages', value: string) => {
    const current = (formData[key] as string[]) ?? []
    updateForm({
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    })
  }

  const showTimeMin = formData.show_time_min ?? SHOW_TIME_RANGE.min
  const showTimeMax = formData.show_time_max ?? SHOW_TIME_RANGE.max
  const priceMin = formData.price_min ?? PRICE_RANGE.min
  const priceMax = formData.price_max ?? PRICE_RANGE.max
  const priceError = priceMin > priceMax ? "The minimum price can't be more than the maximum." : ''

  const setPrice = (key: 'price_min' | 'price_max', raw: string) => {
    const fallback = key === 'price_min' ? PRICE_RANGE.min : PRICE_RANGE.max
    const value = raw === '' ? fallback : Math.max(0, Math.round(Number(raw)))
    updateForm({ [key]: Number.isFinite(value) ? value : fallback })
  }

  return (
    <div className="wizard-scroll-area" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', minWidth: 0 }}>
      <div style={{ flexShrink: 0, minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Filters</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>All optional. Leave them as they are to hear about any show.</p>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontWeight: 600 }}>Format</div>
              <FilterChipsSkeleton count={4} />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontWeight: 600 }}>Language</div>
              <FilterChipsSkeleton count={6} />
            </div>
          </div>
        ) : (
          CHIP_GROUPS.map((group) => {
            const selected = (formData[group.key] as string[]) ?? []
            return (
              <div key={group.key} role="group" aria-labelledby={`filter-${group.key}`} style={{ marginBottom: 20 }}>
                <div id={`filter-${group.key}`} style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontWeight: 600 }}>
                  {group.label}
                </div>
                {group.options.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>Not listed yet</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {group.options.map((opt) => {
                      const on = selected.includes(opt)
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => toggle(group.key, opt)}
                          aria-pressed={on}
                          style={{
                            padding: '7px 14px',
                            minHeight: 36,
                            borderRadius: 500,
                            border: 'none',
                            background: on ? 'rgba(232,201,125,0.12)' : 'var(--bg3)',
                            outline: on ? '1px solid var(--accent)' : 'none',
                            color: on ? 'var(--accent)' : 'var(--text2)',
                            fontSize: 12,
                            fontWeight: on ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: 'var(--font-body)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div role="group" aria-labelledby="filter-showtime" style={{ marginBottom: 24, flexShrink: 0 }}>
        <div id="filter-showtime" style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontWeight: 600 }}>
          Show time
        </div>
        <RangeSlider
          label="Show time"
          min={SHOW_TIME_RANGE.min}
          max={SHOW_TIME_RANGE.max}
          value={[showTimeMin, showTimeMax]}
          onChange={([min, max]) => updateForm({ show_time_min: min, show_time_max: max })}
          step={15}
          formatLabel={formatTime}
        />
      </div>

      <div role="group" aria-labelledby="filter-price" style={{ marginBottom: 24, flexShrink: 0 }}>
        <div id="filter-price" style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontWeight: 600 }}>
          Ticket price
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
          <div>
            <label htmlFor="price-min" style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block', fontWeight: 600 }}>
              Min (₹)
            </label>
            <input
              id="price-min"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={Boolean(priceError)}
              aria-describedby="price-hint"
              value={priceMin}
              onChange={(e) => setPrice('price_min', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-md)',
                background: 'var(--bg3)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                boxShadow: 'none',
              }}
            />
          </div>
          <div>
            <label htmlFor="price-max" style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block', fontWeight: 600 }}>
              Max (₹)
            </label>
            <input
              id="price-max"
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={Boolean(priceError)}
              aria-describedby="price-hint"
              value={priceMax}
              onChange={(e) => setPrice('price_max', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-md)',
                background: 'var(--bg3)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                boxShadow: 'none',
              }}
            />
          </div>
        </div>
        {priceError ? (
          <p id="price-hint" role="alert" style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{priceError}</p>
        ) : (
          <p id="price-hint" style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Leave it at ₹{PRICE_RANGE.min}-₹{PRICE_RANGE.max} to hear about shows at any price.
          </p>
        )}
      </div>
    </div>
  )
}