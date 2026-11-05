import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Step3Filters from '@/components/create-alert/Step3Filters'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { getFormats } from '@/api/movies'

vi.mock('@/api/movies', () => ({
  getFormats: vi.fn(),
}))

const getFormatsMock = vi.mocked(getFormats)

function renderStep() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Step3Filters />
    </QueryClientProvider>
  )
}

function chipNames(): string[] {
  return screen.getAllByRole('button').map((button) => button.textContent ?? '')
}

beforeEach(() => {
  vi.clearAllMocks()
  useCreateAlertStore.getState().resetForm()
  useCreateAlertStore.getState().updateForm({
    city: 'hyderabad',
    city_name: 'Hyderabad',
    movie_id: '194537',
    movie_name: 'Spider-Man',
  })
})

describe('Step3Filters: only this movie’s options', () => {
  test('shows the movie’s formats and languages', async () => {
    getFormatsMock.mockResolvedValue({
      formats: ['2D', 'IMAX 3D'],
      languages: ['English', 'Telugu'],
      release_date: '2026-07-30',
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('2D')).toBeInTheDocument())
    expect(chipNames()).toEqual(expect.arrayContaining(['2D', 'IMAX 3D', 'English', 'Telugu']))
  })

  test('does not offer formats or languages this movie is not shown in', async () => {
    getFormatsMock.mockResolvedValue({
      formats: ['2D', '3D'],
      languages: ['English', 'Hindi'],
      release_date: null,
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('2D')).toBeInTheDocument())
    const names = chipNames()
    expect(names).not.toContain('4DX')
    expect(names).not.toContain('IMAX 3D')
    expect(names).not.toContain('Tamil')
    expect(names).not.toContain('Kannada')
  })

  test('requests options for the selected movie in the selected city', async () => {
    getFormatsMock.mockResolvedValue({ formats: [], languages: [], release_date: null })

    renderStep()

    await waitFor(() => expect(getFormatsMock).toHaveBeenCalledWith('194537', 'Hyderabad'))
  })

  test('re-fetches options when the city changes', async () => {
    getFormatsMock.mockResolvedValue({ formats: ['2D', '3D'], languages: ['Telugu', 'Hindi'], release_date: null })

    const { rerender } = renderStep()
    await waitFor(() => expect(getFormatsMock).toHaveBeenCalledWith('194537', 'Hyderabad'))

    getFormatsMock.mockResolvedValue({ formats: ['IMAX 3D', '4DX'], languages: ['Tamil', 'Telugu'], release_date: null })
    useCreateAlertStore.getState().updateForm({ city: 'chennai', city_name: 'Chennai' })
    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <Step3Filters />
      </QueryClientProvider>
    )

    await waitFor(() => expect(getFormatsMock).toHaveBeenCalledWith('194537', 'Chennai'))
    await waitFor(() => expect(screen.getByText('IMAX 3D')).toBeInTheDocument())
    expect(screen.queryByText('2D')).not.toBeInTheDocument()
  })

  test('collapses casing duplicates into a single chip', async () => {
    getFormatsMock.mockResolvedValue({
      formats: ['IMAX', 'imax', '2D'],
      languages: ['Telugu', 'TELUGU', 'telugu', 'Hindi'],
      release_date: null,
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('IMAX')).toBeInTheDocument())
    const names = chipNames()
    expect(names.filter((name) => name.toLowerCase() === 'imax')).toHaveLength(1)
    expect(names.filter((name) => name.toLowerCase() === 'telugu')).toHaveLength(1)
    expect(names).toContain('2D')
  })

  test('says a filter group is not listed yet when the movie has no options for it', async () => {
    getFormatsMock.mockResolvedValue({
      formats: [],
      languages: ['English', 'Hindi'],
      release_date: null,
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('English')).toBeInTheDocument())
    expect(screen.getByText('Format')).toBeInTheDocument()
    expect(screen.getByText('Not listed yet')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  test('shows a single option as a chip', async () => {
    getFormatsMock.mockResolvedValue({
      formats: ['2D'],
      languages: ['English', 'Hindi'],
      release_date: null,
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('English')).toBeInTheDocument())
    expect(screen.getByText('Format')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2D' })).toBeInTheDocument()
  })

  test('selecting a chip records it on the alert', async () => {
    getFormatsMock.mockResolvedValue({
      formats: ['IMAX 3D', '2D'],
      languages: ['Telugu', 'Hindi'],
      release_date: null,
    })
    const user = userEvent.setup()

    renderStep()
    await waitFor(() => expect(screen.getByText('IMAX 3D')).toBeInTheDocument())

    await user.click(screen.getByText('IMAX 3D'))
    await user.click(screen.getByText('Telugu'))

    expect(useCreateAlertStore.getState().formData.formats).toEqual(['IMAX 3D'])
    expect(useCreateAlertStore.getState().formData.languages).toEqual(['Telugu'])
  })

  test('clicking a selected chip deselects it', async () => {
    getFormatsMock.mockResolvedValue({ formats: ['2D', '3D'], languages: [], release_date: null })
    const user = userEvent.setup()

    renderStep()
    await waitFor(() => expect(screen.getByText('2D')).toBeInTheDocument())

    await user.click(screen.getByText('2D'))
    await user.click(screen.getByText('2D'))

    expect(useCreateAlertStore.getState().formData.formats).toEqual([])
  })

  test('falls back to options captured with the movie when the request fails', async () => {
    getFormatsMock.mockRejectedValue(new Error('offline'))
    useCreateAlertStore.getState().updateForm({
      available_formats: ['2D', '3D'],
      available_languages: ['Hindi', 'Telugu'],
    })

    renderStep()

    await waitFor(() => expect(screen.getByText('2D')).toBeInTheDocument())
    expect(screen.getByText('Hindi')).toBeInTheDocument()
  })
})
