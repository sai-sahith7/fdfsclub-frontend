import { useId, useState } from 'react'
import { Star, X } from 'lucide-react'
import type { City } from '@/types'

const MAX_RESULTS = 6

interface CityPickerProps {
  label: string
  describedBy?: string
  cities: City[]
  value: string
  disabled?: boolean
  onChange: (slug: string | null) => void
}

export default function CityPicker({ label, describedBy, cities, value, disabled, onChange }: CityPickerProps) {
  const id = useId()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const current = cities.find((c) => c.slug === value)
  const matches = (needle ? cities.filter((c) => c.name.toLowerCase().includes(needle)) : cities)
    .filter((c) => c.slug !== value)
    .slice(0, MAX_RESULTS)

  const choose = (slug: string | null) => {
    setQuery('')
    onChange(slug)
  }

  return (
    <div>
      {current ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', minHeight: 44, borderRadius: 8, background: 'rgba(232,201,125,0.08)', outline: '1px solid rgba(232,201,125,0.4)', marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
            <Star size={14} fill="var(--accent)" aria-hidden="true" /> {current.name}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => choose(null)}
            aria-label={`Remove ${current.name} as your favourite city`}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', padding: 6 }}
          >
            <X size={14} aria-hidden="true" /> Remove
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>No favourite city yet.</p>
      )}

      <input
        id={id}
        type="search"
        aria-label={label}
        aria-describedby={describedBy}
        aria-controls={`${id}-results`}
        autoComplete="off"
        enterKeyHint="search"
        disabled={disabled}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={current ? 'Search to change city…' : 'Search cities…'}
        style={{
          width: '100%', padding: '10px 16px', minHeight: 44, borderRadius: 500,
          border: 'none', background: 'var(--bg3)', color: 'var(--text)',
          fontFamily: 'var(--font-body)', boxShadow: 'none', marginBottom: 8,
        }}
      />

      <ul id={`${id}-results`} aria-label={`${label} options`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, listStyle: 'none' }}>
        {matches.map((city) => (
          <li key={city.slug}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => choose(city.slug)}
              style={{
                width: '100%', padding: '10px 14px', minHeight: 44, borderRadius: 6, border: 'none',
                background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, fontWeight: 500,
                textAlign: 'left', cursor: 'pointer',
              }}
            >
              {city.name}
            </button>
          </li>
        ))}
      </ul>
      {needle && matches.length === 0 && (
        <p role="status" style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>No cities match "{query.trim()}".</p>
      )}
    </div>
  )
}
