import { NextResponse } from 'next/server';

const SESSION_COOKIE_BASES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  'campussync.sid',
  '__Secure-campussync.sid',
];

function expireCookie(res: NextResponse, name: string) {
  const secure = name.startsWith('__Secure') || name.startsWith('__Host');
  res.cookies.set(name, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
}

/** Remove legacy oversized NextAuth cookie chunks (fixes 494 REQUEST_HEADER_TOO_LARGE). */
export function clearSessionCookies(res: NextResponse) {
  for (const base of SESSION_COOKIE_BASES) {
    expireCookie(res, base);
    for (let i = 0; i < 16; i++) {
      expireCookie(res, `${base}.${i}`);
    }
  }
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
}

export async function GET(req: Request) {
  const redirect = new URL(req.url).searchParams.get('redirect') || '/login';
  const res = NextResponse.redirect(new URL(redirect, req.url));
  clearSessionCookies(res);
  return res;
}
