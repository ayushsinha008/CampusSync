import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'student' | 'staff'
    }
  }

  interface User {
    role: 'student' | 'staff'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
    role: 'student' | 'staff'
    name?: string | null
    email?: string | null
  }
}
