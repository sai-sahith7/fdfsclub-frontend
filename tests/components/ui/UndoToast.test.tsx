import { describe, test, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UndoToast from '@/components/ui/UndoToast'

afterEach(() => vi.useRealTimers())

describe('UndoToast', () => {
  test('goes away on its own after the countdown', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<UndoToast message="Titans alert cancelled" onUndo={vi.fn()} onDone={onDone} />)

    act(() => vi.advanceTimersByTime(4999))
    expect(onDone).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  test('undo calls back immediately', () => {
    const onUndo = vi.fn()
    render(<UndoToast message="Titans alert cancelled" onUndo={onUndo} onDone={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Titans alert cancelled')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
  })
})
