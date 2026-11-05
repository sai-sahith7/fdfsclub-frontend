import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Step0City from '@/components/create-alert/Step0City'
import { useCreateAlertStore } from '@/store/createAlertStore'
import { useAuthStore } from '@/store/authStore'
import { getCities } from '@/api/cities'
import { resolveLocation } from '@/api/user'
import type { User } from '@/types'

vi.mock('@/api/cities', () => ({
  getCities: vi.fn(),
}))

vi.mock('@/api/user', () => ({
  resolveLocation: vi.fn(),
}))

const CITIES = [
  { _id: '1', name: 'Bengaluru', slug: 'bengaluru' },
  { _id: '2', name: 'Mumbai', slug: 'mumbai' },
  { _id: '3', name: 'Hyderabad', slug: 'hyderabad' },
]

function renderStep() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Step0City />
    </QueryClientProvider>
  )
}

function setUser(favouriteCity: User['favourite_city'] | undefined) {
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
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCities).mockResolvedValue(CITIES as any)
  useCreateAlertStore.getState().resetForm()
})

describe('Step0City: favourite city', () => {
  test('pre-selects the favourite city when the step opens', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })

    renderStep()

    await waitFor(() =>
      expect(useCreateAlertStore.getState().formData.city).toBe('hyderabad')
    )
    expect(useCreateAlertStore.getState().formData.city_name).toBe('Hyderabad')
  })

  test('nothing is pre-selected when the user has no favourite', async () => {
    setUser(undefined)

    renderStep()

    await waitFor(() => expect(screen.getByText('Bengaluru')).toBeInTheDocument())
    expect(useCreateAlertStore.getState().formData.city).toBe('')
  })

  test('does not override a city the user already picked', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })
    useCreateAlertStore.getState().updateForm({ city: 'mumbai', city_name: 'Mumbai' })

    renderStep()

    await waitFor(() => expect(screen.getByText('Mumbai')).toBeInTheDocument())
    expect(useCreateAlertStore.getState().formData.city).toBe('mumbai')
  })

  test('ignores a favourite city that is no longer available', async () => {
    setUser({ name: 'Atlantis', slug: 'atlantis' })

    renderStep()

    await waitFor(() => expect(screen.getByText('Bengaluru')).toBeInTheDocument())
    expect(useCreateAlertStore.getState().formData.city).toBe('')
  })

  test('the user can still choose a different city', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })
    const user = userEvent.setup()

    renderStep()
    await waitFor(() =>
      expect(useCreateAlertStore.getState().formData.city).toBe('hyderabad')
    )

    await user.click(screen.getByText('Mumbai'))

    expect(useCreateAlertStore.getState().formData.city).toBe('mumbai')
    expect(useCreateAlertStore.getState().formData.city_name).toBe('Mumbai')
  })

  test('lists every city exactly once, favourite included', async () => {
    setUser({ name: 'Hyderabad', slug: 'hyderabad' })

    renderStep()

    await waitFor(() => expect(screen.getByText('Hyderabad')).toBeInTheDocument())
    expect(screen.getAllByText('Hyderabad')).toHaveLength(1)
    expect(screen.getByText('Bengaluru')).toBeInTheDocument()
    expect(screen.getByText('Mumbai')).toBeInTheDocument()
  })
})

describe('Step0City: location and city changes', () => {
  test('uses the city the backend resolves from GPS, not a hard-coded one', async () => {
    setUser(undefined)
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({ coords: { latitude: 19.07, longitude: 72.87 } } as GeolocationPosition),
      },
    })
    vi.mocked(resolveLocation).mockResolvedValue({
      city: { id: 2, name: 'Mumbai', slug: 'mumbai' },
    } as any)

    renderStep()
    await userEvent.click(await screen.findByText('Use my location'))

    await waitFor(() => expect(useCreateAlertStore.getState().formData.city).toBe('mumbai'))
    expect(resolveLocation).toHaveBeenCalledWith(19.07, 72.87)
  })

  test('shows a message when location permission is denied', async () => {
    setUser(undefined)
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_: PositionCallback, fail: PositionErrorCallback) => fail({} as GeolocationPositionError) },
    })

    renderStep()
    await userEvent.click(await screen.findByText('Use my location'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/denied/i)
  })

  test('switching city clears theatres picked for the previous city', async () => {
    setUser(undefined)
    useCreateAlertStore.getState().updateForm({ city: 'bengaluru', city_name: 'Bengaluru', theatre_ids: ['9'], theatre_names: ['PVR'] })

    renderStep()
    await userEvent.click(await screen.findByText('Mumbai'))

    const { formData } = useCreateAlertStore.getState()
    expect(formData.city).toBe('mumbai')
    expect(formData.theatre_ids).toEqual([])
    expect(formData.theatre_names).toEqual([])
  })
})
