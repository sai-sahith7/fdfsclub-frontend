import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlertCard from '@/components/alerts/AlertCard'
import type { Alert } from '@/types'

const BASE: Alert = {
  _id: 'a1',
  user_email: 'test@example.com',
  movie: { id: '185027', name: 'The Paradise' },
  city: { name: 'Hyderabad' },
  alert_date: '2026-09-28T00:00:00.000Z',
  status: 'ACTIVE',
  filters: { formats: [], languages: [] },
  created_at: '2026-09-27T00:00:00.000Z',
  updated_at: '2026-09-27T00:00:00.000Z',
}

describe('AlertCard', () => {
  test('never shows where showtimes come from', () => {
    render(
      <AlertCard
        alert={{
          ...BASE,
          venues: [
            { id: '1020777', name: 'INOX Kachiguda', source: 'district' },
            { id: '-1202027', name: 'Prasads Multiplex: Hyderabad', source: 'bookmyshow' },
          ],
        }}
      />
    )
    expect(screen.getByText('INOX Kachiguda +1 more')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/district|bookmyshow/i)
  })

  test('says "Any theatre" when no theatre was picked', () => {
    render(<AlertCard alert={BASE} />)
    expect(screen.getByText('Any theatre')).toBeInTheDocument()
  })

  test('cancelling happens in one tap, since the dashboard offers undo', async () => {
    const onCancel = vi.fn()
    render(<AlertCard alert={BASE} onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel alert' }))
    expect(onCancel).toHaveBeenCalledWith('a1')
  })

  test('the details toggle is announced as expandable', async () => {
    render(<AlertCard alert={BASE} />)
    const toggle = screen.getByRole('button', { name: 'Details' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Any show time')).toBeInTheDocument()
  })
})
