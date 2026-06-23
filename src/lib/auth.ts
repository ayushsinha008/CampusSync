import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

        await connectDB();

        let user = await User.findOne({ email: credentials.email });

        // Auto-create demo accounts if they don't exist
        if (!user) {
          if (credentials.email === 'staff@campus.sync' || credentials.email === 'student@campus.sync') {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await User.create({
              name: credentials.email === 'staff@campus.sync' ? 'Admin Staff' : 'Demo Student',
              email: credentials.email,
              password: hashedPassword,
              role: credentials.email === 'staff@campus.sync' ? 'staff' : 'student',
            });
          } else {
            throw new Error('Invalid email or password');
          }
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
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
