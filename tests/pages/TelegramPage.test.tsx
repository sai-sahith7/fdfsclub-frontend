import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TelegramPage from '@/pages/TelegramPage'
import { useAuthStore } from '@/store/authStore'
import { verifyTelegramCode } from '@/api/telegram'

vi.mock('@/api/telegram', () => ({
  verifyTelegramCode: vi.fn().mockResolvedValue({ status: true }),
  disconnectTelegram: vi.fn().mockResolvedValue({ status: true }),
}))

const verifyMock = vi.mocked(verifyTelegramCode)

function renderPage(initialEntry = '/telegram') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/telegram" element={<TelegramPage />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function otpBoxes(): HTMLInputElement[] {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

function stallVerification() {
  verifyMock.mockReturnValue(new Promise(() => {}))
}

beforeEach(() => {
  vi.clearAllMocks()
  verifyMock.mockResolvedValue({ status: true })
  useAuthStore.setState({
    isLoggedIn: true,
    user: {
      _id: '1',
      email: 'test@example.com',
      name: 'Test User',
      telegram: { chat_id: '', username: '', connected: false },
      created_at: '',
      updated_at: '',
    },
    refreshUser: vi.fn().mockResolvedValue(undefined),
  })
})

describe('TelegramPage: pasting the OTP', () => {
  test('pasting the code fills every box and submits it', async () => {
    stallVerification()
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('123456')

    expect(otpBoxes().map((box) => box.value)).toEqual(['1', '2', '3', '4', '5', '6'])
    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('123456'))
    expect(verifyMock).toHaveBeenCalledTimes(1)
  })

  test('pasting a code copied with spaces still works', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('123 456')

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('123456'))
  })

  test('pasting a whole sentence extracts just the code', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('Your verification code is 483920')

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('483920'))
  })

  test('pasting into a later box still fills from the first box', async () => {
    stallVerification()
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[3])
    await user.paste('654321')

    expect(otpBoxes().map((box) => box.value)).toEqual(['6', '5', '4', '3', '2', '1'])
    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('654321'))
  })

  test('a partial paste fills forward from the focused box without submitting', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('12')

    expect(otpBoxes().map((box) => box.value)).toEqual(['1', '2', '', '', '', ''])
    expect(verifyMock).not.toHaveBeenCalled()
  })

  test('pasting text with no digits leaves the boxes untouched', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('no code here')

    expect(otpBoxes().every((box) => box.value === '')).toBe(true)
    expect(verifyMock).not.toHaveBeenCalled()
  })

  test('shows the server error and clears the boxes on a bad code', async () => {
    verifyMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 400, data: { message: 'Invalid or expired verification code' } } })
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('111111')

    expect(await screen.findByText('Invalid or expired verification code')).toBeInTheDocument()
    await waitFor(() => expect(otpBoxes().every((box) => box.value === '')).toBe(true))
  })
})

describe('TelegramPage: typing the OTP', () => {
  test('typing all six digits advances and submits', async () => {
    stallVerification()
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.keyboard('246810')

    expect(otpBoxes().map((box) => box.value)).toEqual(['2', '4', '6', '8', '1', '0'])
    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('246810'))
  })

  test('non-numeric keystrokes are rejected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.keyboard('a')

    expect(otpBoxes()[0].value).toBe('')
  })
})

describe('TelegramPage: bot deep link', () => {
  test('a ?code= link from the bot verifies without any typing', async () => {
    renderPage('/telegram?code=778899')

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('778899'))
    expect(await screen.findByText('Telegram connected')).toBeInTheDocument()
  })

  test('a code saved before sign-in verifies once the person is back', async () => {
    sessionStorage.setItem('fdfsclub-telegram-code', '445566')
    renderPage('/telegram')

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('445566'))
    expect(sessionStorage.getItem('fdfsclub-telegram-code')).toBeNull()
  })

  test('ignores a malformed code in the link', async () => {
    renderPage('/telegram?code=abc')

    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(6))
    expect(verifyMock).not.toHaveBeenCalled()
  })

  test('surfaces the error when the linked code has expired', async () => {
    verifyMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 400, data: { message: 'Invalid or expired verification code' } } })

    renderPage('/telegram?code=778899')

    expect(await screen.findByText('Invalid or expired verification code')).toBeInTheDocument()
  })
})

describe('TelegramPage: errors', () => {
  test('a server error shows a friendly message, not the raw error', async () => {
    verifyMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 500, data: { message: 'MongoServerError: E11000' } } })
    const user = userEvent.setup()
    renderPage()

    await user.click(otpBoxes()[0])
    await user.paste('111111')

    expect(await screen.findByText("We couldn't connect Telegram. Please try again.")).toBeInTheDocument()
    expect(screen.queryByText(/E11000/)).not.toBeInTheDocument()
  })
})
