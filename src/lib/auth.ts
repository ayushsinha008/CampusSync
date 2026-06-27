import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { normalizeEmail } from '@/lib/auth-session';
import { getNextAuthSecret, getStaffPasswordForAuth } from '@/lib/env';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');
const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'student@college.edu' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide all required fields');
        }

        const email = normalizeEmail(credentials.email);
        await connectDB();

        let user = await User.findOne({ email });

        if (!user && email === STAFF_EMAIL && credentials.password === getStaffPasswordForAuth()) {
          const hashedPassword = await bcrypt.hash(getStaffPasswordForAuth(), 10);
          user = await User.create({
            name: 'Campus Admin',
            email: STAFF_EMAIL,
            password: hashedPassword,
            role: 'staff',
            entryToken: randomUUID(),
          });
        }

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.password) {
          throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-campussync.sid' : 'campussync.sid',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.uid = user.id;
        token.role = ((user as { role?: string }).role || 'student') as 'student' | 'staff';
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === 'update' && session) {
        const data = session as { name?: string };
        if (data.name) token.name = data.name;
      }

      delete token.picture;
      delete token.id;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) || (token.sub as string);
        session.user.role = token.role as 'student' | 'staff';
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email || '';
        session.user.image = null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: getNextAuthSecret(),
};
