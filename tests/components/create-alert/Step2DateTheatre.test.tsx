import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Step2DateTheatre from '@/components/create-alert/Step2DateTheatre'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { getTheatres, refreshVenues } from '@/api/cities'

vi.mock('@/api/cities', () => ({
  getTheatres: vi.fn().mockResolvedValue([]),
  refreshVenues: vi.fn().mockResolvedValue({ message: 'ok', refreshed: true, moreComing: false }),
}))

vi.mocked(getTheatres).mockResolvedValue([])

const NOW = new Date('2026-07-26T06:30:00Z')

function renderStep() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Step2DateTheatre />
    </QueryClientProvider>
  )
}

function datePillNumbers(): number[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.textContent ?? '')
    .map((text) => text.match(/^[A-Za-z]{3}(\d{1,2})[A-Za-z]{3}$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number)
}

function dateButtons(): HTMLElement[] {
  return screen
    .getAllByRole('button')
    .filter((button) => /^[A-Za-z]{3}\d{1,2}[A-Za-z]{3}$/.test(button.textContent ?? ''))
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
  useCreateAlertStore.getState().resetForm()
  useCreateAlertStore.getState().updateForm({ city: 'hyderabad', city_name: 'Hyderabad' })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Step2DateTheatre: date window', () => {
  test('offers 11 days starting today for a released movie', async () => {
    useCreateAlertStore.getState().updateForm({ movie_release_date: '2026-07-01' })

    renderStep()

    await waitFor(() => expect(dateButtons().length).toBe(11))
    expect(datePillNumbers()[0]).toBe(26)
    expect(datePillNumbers()[10]).toBe(5)
  })

  test('starts at the release date for an unreleased movie', async () => {
    useCreateAlertStore.getState().updateForm({ movie_release_date: '2026-07-30' })

    renderStep()

    await waitFor(() => expect(dateButtons().length).toBe(11))
    expect(datePillNumbers()[0]).toBe(30)
    expect(datePillNumbers()).not.toContain(26)
  })

  test('explains why the dates start later', async () => {
    useCreateAlertStore.getState().updateForm({ movie_release_date: '2026-07-30' })

    renderStep()

    expect(await screen.findByText(/releases Thu, 30 Jul/)).toBeInTheDocument()
  })

  test('falls back to today when the movie has no release date', async () => {
    renderStep()

    await waitFor(() => expect(dateButtons().length).toBe(11))
    expect(datePillNumbers()[0]).toBe(26)
  })

  test('never offers a date before release', async () => {
    useCreateAlertStore.getState().updateForm({ movie_release_date: '2026-08-14' })

    renderStep()

    await waitFor(() => expect(dateButtons().length).toBe(11))
    expect(datePillNumbers()).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])
  })

  test('picking a date stores its ISO value', async () => {
    useCreateAlertStore.getState().updateForm({ movie_release_date: '2026-07-30' })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    renderStep()
    await waitFor(() => expect(dateButtons().length).toBe(11))

    await user.click(dateButtons()[0])

    expect(useCreateAlertStore.getState().formData.date).toBe('2026-07-30')
  })
})

describe('Step2DateTheatre: theatres', () => {
  test('deselecting one of two same-named theatres keeps ids and names aligned', async () => {
    vi.mocked(getTheatres).mockResolvedValueOnce([
      { _id: '1', name: 'PVR', address: 'Forum Mall' },
      { _id: '2', name: 'PVR', address: 'Inorbit Mall' },
    ] as any)

    renderStep()
    await userEvent.click(await screen.findByText('Forum Mall'))
    await userEvent.click(screen.getByText('Inorbit Mall'))
    await userEvent.click(screen.getByText('Forum Mall'))

    const { formData } = useCreateAlertStore.getState()
    expect(formData.theatre_ids).toEqual(['2'])
    expect(formData.theatre_names).toEqual(['PVR'])
  })
})

describe('Step2DateTheatre: copy', () => {
  test('never names where theatres come from', async () => {
    vi.mocked(getTheatres).mockResolvedValueOnce([
      { _id: '1020777', name: 'INOX Kachiguda', source: 'district' },
      { _id: '-1202027', name: 'Prasads Multiplex: Hyderabad', source: 'bookmyshow' },
    ])

    renderStep()

    await screen.findByText('INOX Kachiguda')
    expect(document.body).not.toHaveTextContent(/district|bookmyshow/i)
  })

  test('a refresh that is still finding theatres says so in plain words', async () => {
    vi.mocked(refreshVenues).mockResolvedValueOnce({ message: 'ok', refreshed: true, moreComing: true })
    renderStep()

    await userEvent.click(await screen.findByRole('button', { name: 'Refresh theatre list' }))

    expect(await screen.findByText(/Still looking for more theatres in this city\. Check back in a little while\./)).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/district|bookmyshow/i)
  })
})

describe('Step2DateTheatre: nudge to pick a date', () => {
  test('tapping Continue without a date scrolls to and outlines the dates', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderStep()
    await waitFor(() => expect(dateButtons().length).toBe(11))
    const group = screen.getByRole('group', { name: 'Date' })

    act(() => useCreateAlertStore.getState().nudgeMissing())

    expect(scrollIntoView).toHaveBeenCalled()
    expect(group.style.outline).toContain('var(--accent)')
  })

  test('does nothing once a date is picked', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    useCreateAlertStore.getState().updateForm({ date: '2026-07-27' })
    renderStep()
    await waitFor(() => expect(dateButtons().length).toBe(11))

    act(() => useCreateAlertStore.getState().nudgeMissing())

    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
