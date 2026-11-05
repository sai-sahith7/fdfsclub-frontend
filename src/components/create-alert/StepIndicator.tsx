interface StepIndicatorProps {
  current: number
  total: number
  label?: string
}

export default function StepIndicator({ current, total, label }: StepIndicatorProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-valuetext={`Step ${current + 1} of ${total}${label ? `: ${label}` : ''}`}
      aria-label={`Step ${current + 1} of ${total}${label ? `: ${label}` : ''}`}
      style={{ display: 'flex', gap: 6, padding: '8px 0', alignItems: 'center' }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            height: 4,
            borderRadius: 2,
            background: i <= current ? 'var(--accent)' : 'var(--bg4)',
            width: i === current ? 24 : 8,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
      <span aria-hidden="true" style={{ marginLeft: 8, fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>
        {current + 1}/{total}{label ? ` · ${label}` : ''}
      </span>
    </div>
  )
}
