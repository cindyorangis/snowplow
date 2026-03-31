import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { name, email, phone, message } = await req.json()

  try {
    // Notify you
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL!,
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    // Auto-reply to customer
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `We received your message — Snow Plow Services`,
      html: `
        <h2>Thanks for reaching out, ${name}!</h2>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <br />
        <p>— The Snow Plow Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
