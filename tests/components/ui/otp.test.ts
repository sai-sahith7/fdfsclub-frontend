import { describe, test, expect } from 'vitest'
import { extractOtpDigits, fillOtpDigits } from '@/components/ui/otp'

describe('extractOtpDigits', () => {
  test('keeps a plain 6-digit code as-is', () => {
    expect(extractOtpDigits('123456')).toBe('123456')
  })

  test('strips the spaces Telegram inserts when copying', () => {
    expect(extractOtpDigits('123 456')).toBe('123456')
  })

  test('pulls the code out of a sentence', () => {
    expect(extractOtpDigits('Your verification code is 483920.')).toBe('483920')
  })

  test('ignores newlines and tabs from a multi-line copy', () => {
    expect(extractOtpDigits('\n123456\t')).toBe('123456')
  })

  test('truncates anything longer than the code', () => {
    expect(extractOtpDigits('1234567890')).toBe('123456')
  })

  test('returns empty when there are no digits at all', () => {
    expect(extractOtpDigits('no code here')).toBe('')
    expect(extractOtpDigits('')).toBe('')
  })

  test('honours a custom length', () => {
    expect(extractOtpDigits('12345678', 4)).toBe('1234')
  })
})

describe('fillOtpDigits', () => {
  const empty = Array(6).fill('')

  test('a full paste fills every box', () => {
    expect(fillOtpDigits(empty, '123456')).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  test('a partial paste fills from the given box onward', () => {
    expect(fillOtpDigits(empty, '99', 2)).toEqual(['', '', '9', '9', '', ''])
  })

  test('does not overflow past the last box', () => {
    expect(fillOtpDigits(empty, '123456', 4)).toEqual(['', '', '', '', '1', '2'])
  })

  test('leaves untouched boxes alone', () => {
    const current = ['1', '2', '3', '4', '5', '6']
    expect(fillOtpDigits(current, '9', 0)).toEqual(['9', '2', '3', '4', '5', '6'])
  })

  test('cleans a messy paste before filling', () => {
    expect(fillOtpDigits(empty, 'code: 12 34 56')).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  test('a paste with no digits changes nothing', () => {
    expect(fillOtpDigits(empty, 'hello')).toEqual(empty)
  })
})
