export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const ALERT_DATE_WINDOW_DAYS = 10

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function toIsoDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return isNaN(parsed.getTime()) ? null : parsed
}

export function getAlertDateOptions(
  releaseDate?: string | null,
  now: Date = new Date(),
  days = ALERT_DATE_WINDOW_DAYS
): Array<{ day: string; num: number; mon: string; iso: string }> {
  const today = parseIsoDate(toIsoDate(now)) as Date
  const release = parseIsoDate(releaseDate)
  const start = release && release > today ? release : today

  const result: Array<{ day: string; num: number; mon: string; iso: string }> = []

  for (let offset = 0; offset <= days; offset++) {
    const date = new Date(start.getTime() + offset * MS_PER_DAY)
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).formatToParts(date)

    let day = '', mon = '', num = 0
    for (const part of parts) {
      if (part.type === 'weekday') day = part.value
      if (part.type === 'month') mon = part.value
      if (part.type === 'day') num = parseInt(part.value)
    }

    result.push({ day, mon, num, iso: date.toISOString().split('T')[0] })
  }

  return result
}

export function formatReleaseLabel(releaseDate?: string | null, now: Date = new Date()): string | null {
  const release = parseIsoDate(releaseDate)
  if (!release) return null
  const today = parseIsoDate(toIsoDate(now)) as Date
  if (release < today) return 'In theatres'
  if (release.getTime() === today.getTime()) return 'Releases today'
  const label = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(release)
  return `Releases ${label}`
}
