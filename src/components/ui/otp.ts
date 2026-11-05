export function extractOtpDigits(text: string, length = 6): string {
  if (!text) return ''
  return text.replace(/\D/g, '').slice(0, length)
}

export function fillOtpDigits(
  current: string[],
  pasted: string,
  startIndex = 0
): string[] {
  const digits = extractOtpDigits(pasted, current.length - startIndex)
  const next = [...current]
  digits.split('').forEach((char, offset) => {
    next[startIndex + offset] = char
  })
  return next
}
