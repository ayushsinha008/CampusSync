import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { normalizeEmail } from '@/lib/auth-session';
import { getNextAuthSecret, getStaffPasswordForAuth } from '@/lib/env';
import { isStorableSessionImage } from '@/lib/session-image';

const STAFF_EMAIL = normalizeEmail(process.env.STAFF_EMAIL || 'staff@campus.sync');

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
          image: isStorableSessionImage(user.image) ? user.image : null,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as { role?: string }).role || 'student') as 'student' | 'staff';
        token.name = user.name;
        token.email = user.email;
        if (isStorableSessionImage(user.image)) {
          token.picture = user.image;
        } else {
          delete token.picture;
        }
      }
      if (trigger === 'update' && session) {
        const data = session as { name?: string; email?: string; image?: string };
        if (data.name) token.name = data.name;
        if (data.email) token.email = data.email;
        if (data.image && isStorableSessionImage(data.image)) {
          token.picture = data.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'student' | 'staff';
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = isStorableSessionImage(token.picture as string)
          ? (token.picture as string)
          : null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: getNextAuthSecret(),
};
