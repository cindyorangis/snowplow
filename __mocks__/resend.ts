import { vi } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' })

const Resend = vi.fn().mockImplementation(function (this: {
  emails: { send: typeof mockSend }
}) {
  this.emails = {
    send: mockSend,
  }
})

export { Resend, mockSend }
