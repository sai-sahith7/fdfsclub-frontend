function casingScore(value: string): number {
  const hasLower = /[a-z]/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  if (hasLower && hasUpper) return 2
  if (hasUpper) return 1
  return 0
}

export function dedupeIgnoreCase(values: (string | null | undefined)[] | undefined | null): string[] {
  if (!values) return []

  const byKey = new Map<string, { value: string; order: number }>()

  for (const raw of values) {
    if (raw == null) continue
    const value = String(raw).trim()
    if (!value) continue

    const key = value.toLowerCase()
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, { value, order: byKey.size })
      continue
    }

    const better =
      casingScore(value) > casingScore(existing.value) ||
      (casingScore(value) === casingScore(existing.value) && value < existing.value)

    if (better) existing.value = value
  }

  return [...byKey.values()].sort((a, b) => a.order - b.order).map((entry) => entry.value)
}
