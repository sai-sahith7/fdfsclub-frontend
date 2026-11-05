import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProfilePage from '@/pages/ProfilePage'
import { useAuthStore } from '@/store/authStore'
import { getCities } from '@/api/cities'
import { setFavouriteCity } from '@/api/user'
import type { User } from '@/types'

vi.mock('@/api/cities', () => ({ getCities: vi.fn() }))
vi.mock('@/api/user', () => ({ setFavouriteCity: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useSignOut: () => vi.fn() }))

const CITIES = [
  { _id: '1', name: 'Bengaluru', slug: 'bengaluru' },
  { _id: '2', name: 'Hyderabad', slug: 'hyderabad' },
]

const setFavouriteCityMock = vi.mocked(setFavouriteCity)
const refreshUser = vi.fn().mockResolvedValue(undefined)

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function setUser(favouriteCity?: User['favourite_city']) {
  useAuthStore.setState({
    isLoggedIn: true,
    user: {
      _id: '1',
      email: 'test@example.com',
      name: 'Test User',
      favourite_city: favouriteCity,
      created_at: '',
      updated_at: '',
    },
    refreshUser,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCities).mockResolvedValue(CITIES as any)
  setFavouriteCityMock.mockResolvedValue({} as User)
  setUser(undefined)
})

describe('ProfilePage: favourite city', () => {
  test('refreshes the profile on load', async () => {
    renderPage()
    await waitFor(() => expect(refreshUser).toHaveBeenCalled())
  })

  test('offers cities to search when there is no favourite', async () => {
    renderPage()

    expect(await screen.findByText('No favourite city yet.')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Bengaluru' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hyderabad' })).toBeInTheDocument()
  })

  test('shows the current favourite and leaves it out of the options', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })

    renderPage()

    expect(await screen.findByRole('button', { name: 'Remove Hyderabad as your favourite city' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hyderabad' })).not.toBeInTheDocument()
  })

  test('search narrows the options', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(await screen.findByLabelText('Favourite city'), 'beng')

    expect(screen.getByRole('button', { name: 'Bengaluru' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hyderabad' })).not.toBeInTheDocument()
  })

  test('saving a favourite calls the API and refreshes the profile', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Bengaluru' }))

    await waitFor(() => expect(setFavouriteCityMock).toHaveBeenCalledWith('bengaluru'))
    await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(2))
  })

  test('removing the favourite clears it', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Remove Hyderabad as your favourite city' }))

    await waitFor(() => expect(setFavouriteCityMock).toHaveBeenCalledWith(null))
  })

  test('surfaces a save failure', async () => {
    setFavouriteCityMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404, data: { message: 'City not found' } } })
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Bengaluru' }))

    expect(await screen.findByText('City not found')).toBeInTheDocument()
  })
})
