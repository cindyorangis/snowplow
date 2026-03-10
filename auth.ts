import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Hardcoded test users — replace with real DB lookup later
        const users = [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@snowpro.ca',
            password: 'admin123',
            role: 'admin',
          },
          {
            id: '2',
            name: 'Test Customer',
            email: 'customer@test.com',
            password: 'customer123',
            role: 'customer',
          },
          {
            id: '3',
            name: 'Test Employee',
            email: 'employee@test.com',
            password: 'employee123',
            role: 'employee',
          },
        ]

        const user = users.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        )

        if (!user) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role as 'customer' | 'employee' | 'admin'
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
