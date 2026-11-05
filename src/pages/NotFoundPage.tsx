import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  return (
    <div style={{ padding: '64px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 360, lineHeight: 1.6 }}>
        This link doesn't go anywhere. It may be old or mistyped.
      </p>
      <Button onClick={() => navigate('/')}>Go to the home page</Button>
    </div>
  )
}
