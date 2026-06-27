const isProd = process.env.NODE_ENV === 'production';

/** Shared NextAuth session cookie — must match in auth.ts and middleware.ts */
export const sessionCookie = {
  name: isProd ? '__Secure-campussync.sid' : 'campussync.sid',
  options: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: isProd,
  },
};

export const LEGACY_SESSION_COOKIE_BASES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  sessionCookie.name,
];
