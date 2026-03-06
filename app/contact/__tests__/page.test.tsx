import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPage from '../page'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('Contact Form UI', () => {
  it('renders all form fields', () => {
    render(<ContactPage />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send message/i })
    ).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()

    // Never resolves — simulates slow network
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(<ContactPage />)

    await user.type(screen.getByLabelText(/name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
  })

  it('shows success message after valid submission', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({ ok: true })

    render(<ContactPage />)

    await user.type(screen.getByLabelText(/name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument()
    })
  })

  it('clears form fields after successful submission', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: true })

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
    })
  })

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: false })

    render(<ContactPage />)

    await user.type(screen.getByLabelText(/name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it('calls the correct API endpoint', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({ ok: true })

    render(<ContactPage />)

    await user.type(screen.getByLabelText(/name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})
