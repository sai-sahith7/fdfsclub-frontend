interface SkeletonProps {
  height?: number | string
  width?: number | string
  borderRadius?: number | string
  style?: React.CSSProperties
}

export default function Skeleton({ height = 16, width = '100%', borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function AlertCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        gap: 14,
      }}
    >
      <Skeleton width={50} height={68} borderRadius={6} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={11} width="80%" />
        <Skeleton height={11} width="50%" />
      </div>
    </div>
  )
}

export function MovieCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        borderRadius: 6,
        background: 'var(--bg3)',
        alignItems: 'center',
      }}
    >
      <Skeleton width={42} height={56} borderRadius={4} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={13} width="70%" />
        <Skeleton height={10} width="30%" borderRadius={100} />
      </div>
    </div>
  )
}

export function CityCardSkeleton() {
  return (
    <Skeleton
      height={42}
      width="100%"
      borderRadius={6}
      style={{ background: 'linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
    />
  )
}

export function TheatreCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--bg3)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={13} width="55%" />
        <Skeleton height={11} width="75%" />
      </div>
      <Skeleton width={18} height={18} borderRadius={4} style={{ flexShrink: 0 }} />
    </div>
  )
}

export function FilterChipsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          height={32}
          width={60 + Math.random() * 40}
          borderRadius={500}
        />
      ))}
    </div>
  )
}