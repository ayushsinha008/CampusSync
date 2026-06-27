import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

/** All authenticated app routes (dashboard route group). */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/teachers/:path*',
    '/attendance/:path*',
    '/tasks/:path*',
    '/timetable/:path*',
    '/calendar/:path*',
    '/grades/:path*',
    '/transcript/:path*',
    '/certificates/:path*',
    '/tuition/:path*',
    '/payments/:path*',
    '/financial-aid/:path*',
    '/organizations/:path*',
    '/notices/:path*',
    '/housing/:path*',
    '/notes/:path*',
    '/profile/:path*',
  ],
};
