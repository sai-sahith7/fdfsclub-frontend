import { useCallback, useRef, useState } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  formatLabel?: (value: number) => string
  prefix?: string
  label?: string
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatLabel,
  prefix = '',
  label = 'Range',
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  
  const pctOf = (v: number) => ((v - min) / (max - min)) * 100

  const valFromPct = useCallback(
    (pct: number) => {
      const raw = min + (pct / 100) * (max - min)
      const stepped = Math.round(raw / step) * step
      return Math.max(min, Math.min(max, stepped))
    },
    [min, max, step]
  )

  const getPctFromMouse = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0
      const rect = trackRef.current.getBoundingClientRect()
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    },
    []
  )

  const handlePointerDown = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(which)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const pct = getPctFromMouse(e.clientX)
    const v = valFromPct(pct)
    if (dragging === 'min') {
      onChange([Math.min(v, value[1] - step), value[1]])
    } else {
      onChange([value[0], Math.max(v, value[0] + step)])
    }
  }

  const handlePointerUp = () => setDragging(null)

  const handleThumbKeyDown = (which: 'min' | 'max') => (e: React.KeyboardEvent) => {
    const current = which === 'min' ? value[0] : value[1]
    const deltas: Record<string, number> = {
      ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step,
      PageDown: -step * 4, PageUp: step * 4,
    }
    let next: number
    if (e.key in deltas) next = current + deltas[e.key]
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    if (which === 'min') onChange([Math.max(min, Math.min(next, value[1] - step)), value[1]])
    else onChange([value[0], Math.min(max, Math.max(next, value[0] + step))])
  }

  const valueText = (v: number) => (formatLabel ? formatLabel(v) : `${prefix}${v}`)

  const leftPct = pctOf(value[0])
  const rightPct = pctOf(value[1])

  return (
    <div>
      {formatLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
            {formatLabel(value[0])}
          </span>
          <span aria-hidden="true" style={{ fontSize: 12, color: 'var(--text3)' }}>to</span>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
            {formatLabel(value[1])}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          height: 36,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: 'var(--bg4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            height: 4,
            borderRadius: 2,
            background: 'var(--accent)',
          }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} from`}
          aria-valuemin={min}
          aria-valuemax={value[1] - step}
          aria-valuenow={value[0]}
          aria-valuetext={valueText(value[0])}
          onKeyDown={handleThumbKeyDown('min')}
          onPointerDown={handlePointerDown('min')}
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: dragging === 'min' ? 'var(--accent)' : 'var(--bg)',
            border: '2px solid var(--accent)',
            transform: 'translateX(-50%)',
            cursor: 'grab',
            transition: dragging ? 'none' : 'left 0.1s',
            zIndex: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} to`}
          aria-valuemin={value[0] + step}
          aria-valuemax={max}
          aria-valuenow={value[1]}
          aria-valuetext={valueText(value[1])}
          onKeyDown={handleThumbKeyDown('max')}
          onPointerDown={handlePointerDown('max')}
          style={{
            position: 'absolute',
            left: `${rightPct}%`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: dragging === 'max' ? 'var(--accent)' : 'var(--bg)',
            border: '2px solid var(--accent)',
            transform: 'translateX(-50%)',
            cursor: 'grab',
            transition: dragging ? 'none' : 'left 0.1s',
            zIndex: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  )
}
