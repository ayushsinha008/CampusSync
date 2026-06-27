import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuthSession from '@/models/AuthSession';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { normalizeEmail } from '@/lib/auth-session';
import { getNextAuthSecret, getStaffPasswordForAuth } from '@/lib/env';
import { sessionCookie } from '@/lib/session-cookie';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

async function createSession(userId: string) {
  await connectDB();
  const sid = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await AuthSession.create({ sid, userId, expiresAt });
  return sid;
}

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
    maxAge: SESSION_MAX_AGE,
  },
  cookies: {
    sessionToken: sessionCookie,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const sid = await createSession(user.id);
        return {
          sid,
          uid: user.id,
          role: ((user as { role?: string }).role || 'student') as 'student' | 'staff',
          name: user.name,
          email: user.email,
        };
      }

      if (typeof token.sid === 'string' && token.uid) {
        return {
          sid: token.sid,
          uid: token.uid,
          role: token.role,
          name: token.name,
          email: token.email,
        };
      }

      return {};
    },
    async session({ session, token }) {
      if (!token.uid || typeof token.uid !== 'string') {
        return session;
      }

      session.user.id = token.uid;
      session.user.role = (token.role as 'student' | 'staff') || 'student';
      session.user.name = (token.name as string) ?? session.user.name;
      session.user.email = (token.email as string) ?? session.user.email ?? '';
      session.user.image = null;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sid && typeof token.sid === 'string') {
        await connectDB();
        await AuthSession.deleteOne({ sid: token.sid });
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: getNextAuthSecret(),
};
