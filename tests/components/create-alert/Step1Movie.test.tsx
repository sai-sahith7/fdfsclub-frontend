import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Step1Movie from '@/components/create-alert/Step1Movie'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { getAllMovies } from '@/api/movies'

vi.mock('@/api/movies', () => ({
  getAllMovies: vi.fn(),
  requestMovie: vi.fn().mockResolvedValue({ message: 'ok' }),
}))

const MOVIES = [
  { contentId: 1, name: 'Alpha', censor: 'UA', release_date: '2026-07-01', languages: ['English'], screen_formats: ['2D'] },
  { contentId: 2, name: 'Bravo', censor: 'UA', release_date: '2026-08-01', languages: ['Telugu'], screen_formats: ['IMAX 3D'] },
  { contentId: 3, name: 'Charlie', censor: 'A', release_date: null, languages: ['Hindi'], screen_formats: ['4DX'] },
]

function renderStep() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Step1Movie />
    </QueryClientProvider>
  )
}

function movieOrder(): string[] {
  return Array.from(document.querySelectorAll('.wizard-scroll-area button[aria-pressed]')).map(
    (button) => button.querySelector('div > div')?.textContent ?? ''
  ).map((text) => MOVIES.find((m) => text.startsWith(m.name))?.name ?? text)
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.mocked(getAllMovies).mockResolvedValue({
    movies: MOVIES as any,
    total: MOVIES.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  useCreateAlertStore.getState().resetForm()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Step1Movie: selected movie is pinned, the list stays put', () => {
  test('list starts in its natural order with nothing pinned', async () => {
    renderStep()
    await waitFor(() => expect(movieOrder()).toEqual(['Alpha', 'Bravo', 'Charlie']))
    expect(screen.queryByRole('region', { name: 'Selected movie' })).not.toBeInTheDocument()
  })

  test('picking a movie pins it without reordering the list', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderStep()
    await waitFor(() => expect(movieOrder()).toEqual(['Alpha', 'Bravo', 'Charlie']))

    await user.click(screen.getByRole('button', { name: /Charlie/ }))

    expect(movieOrder()).toEqual(['Alpha', 'Bravo', 'Charlie'])
    expect(screen.getByRole('region', { name: 'Selected movie' })).toHaveTextContent('Charlie')
  })

  test('changing the selection updates the pinned row', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderStep()
    await waitFor(() => expect(movieOrder()).toHaveLength(3))

    await user.click(screen.getByRole('button', { name: /Charlie/ }))
    await user.click(screen.getByRole('button', { name: /Bravo/ }))

    expect(screen.getByRole('region', { name: 'Selected movie' })).toHaveTextContent('Bravo')
    expect(movieOrder()).toEqual(['Alpha', 'Bravo', 'Charlie'])
  })

  test('shows the selection even when it is not in the current list', async () => {
    useCreateAlertStore.getState().updateForm({ movie_id: '999', movie_name: 'Not Listed' })
    renderStep()
    await waitFor(() => expect(movieOrder()).toHaveLength(3))

    expect(screen.getByRole('region', { name: 'Selected movie' })).toHaveTextContent('Not Listed')
  })
})

describe('Step1Movie: selection captures alert inputs', () => {
  test('stores the movie, its release date and its filter options', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderStep()
    await waitFor(() => expect(screen.getByText('Bravo')).toBeInTheDocument())

    await user.click(screen.getByText('Bravo'))

    const { formData } = useCreateAlertStore.getState()
    expect(formData.movie_id).toBe('2')
    expect(formData.movie_name).toBe('Bravo')
    expect(formData.movie_release_date).toBe('2026-08-01')
    expect(formData.available_formats).toEqual(['IMAX 3D'])
    expect(formData.available_languages).toEqual(['Telugu'])
  })

  test('switching movies clears the date and filters chosen for the old one', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    useCreateAlertStore.getState().updateForm({
      date: '2026-07-10',
      formats: ['2D'],
      languages: ['English'],
    })

    renderStep()
    await waitFor(() => expect(screen.getByText('Bravo')).toBeInTheDocument())

    await user.click(screen.getByText('Bravo'))

    const { formData } = useCreateAlertStore.getState()
    expect(formData.date).toBe('')
    expect(formData.formats).toEqual([])
    expect(formData.languages).toEqual([])
  })
})
