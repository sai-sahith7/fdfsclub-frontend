import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const VARIANT_STYLES = {
  primary: {
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    fontWeight: 700,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid #7c7c7c',
    fontWeight: 600,
  },
  outline: {
    background: 'transparent',
    color: 'var(--text2)',
    border: '1px solid #4d4d4d',
    fontWeight: 600,
  },
  danger: {
    background: 'transparent',
    color: 'var(--red)',
    border: '1px solid rgba(243,114,127,0.3)',
    fontWeight: 600,
  },
}

const SIZE_STYLES = {
  sm: { padding: '6px 16px', fontSize: 12, borderRadius: 500 },
  md: { padding: '10px 24px', fontSize: 14, borderRadius: 500 },
  lg: { padding: '14px 32px', fontSize: 14, borderRadius: 500 },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  style,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        width: fullWidth ? '100%' : undefined,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        opacity: props.disabled ? 0.4 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}