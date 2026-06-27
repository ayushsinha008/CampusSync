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

async function loadSessionUser(sid: string) {
  await connectDB();
  const record = await AuthSession.findOne({ sid, expiresAt: { $gt: new Date() } });
  if (!record) return null;
  const user = await User.findById(record.userId).select('name email image role');
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as 'student' | 'staff',
  };
}

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
        return { sid };
      }

      if (typeof token.sid === 'string') {
        return { sid: token.sid };
      }

      return {};
    },
    async session({ session, token }) {
      if (!token.sid || typeof token.sid !== 'string') {
        return session;
      }

      const user = await loadSessionUser(token.sid);
      if (!user) {
        return session;
      }

      session.user.id = user.id;
      session.user.role = user.role;
      session.user.name = user.name;
      session.user.email = user.email;
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
