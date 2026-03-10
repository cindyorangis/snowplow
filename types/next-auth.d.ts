import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'customer' | 'employee' | 'admin'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}