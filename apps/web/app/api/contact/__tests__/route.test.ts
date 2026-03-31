import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { mockSend } from '../../../../__mocks__/resend'

vi.mock('resend')

vi.stubEnv('RESEND_API_KEY', 're_test_key')
vi.stubEnv('CONTACT_EMAIL', 'hello@snowplow.services')

function makeRequest(body: object) {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: 'John Smith',
  email: 'john@example.com',
  phone: '416-555-0100',
  message: 'I need my driveway plowed.',
}

beforeEach(() => {
  mockSend.mockClear()
})

describe('POST /api/contact', () => {
  it('returns 200 on valid submission', async () => {
    const res = await POST(makeRequest(validBody))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('sends two emails — notification and auto-reply', async () => {
    await POST(makeRequest(validBody))

    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('sends notification email to contact address', async () => {
    await POST(makeRequest(validBody))

    const firstCall = mockSend.mock.calls[0][0]
    expect(firstCall.to).toBe('hello@snowplow.services')
    expect(firstCall.subject).toContain('John Smith')
  })

  it('sends auto-reply to customer email', async () => {
    await POST(makeRequest(validBody))

    const secondCall = mockSend.mock.calls[1][0]
    expect(secondCall.to).toBe('john@example.com')
  })

  it('returns 500 when Resend throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('Resend error'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
  })
})
