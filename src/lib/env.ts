/** Server-only env helpers — never import from client components. */

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/** Staff password — validated only when staff login is attempted. */
export function getStaffPasswordForAuth(): string {
  const value = process.env.STAFF_PASSWORD;
  if (!value) {
    if (isProduction()) {
      throw new Error('STAFF_PASSWORD must be set in production (Vercel Environment Variables).');
    }
    return 'password123';
  }
  return value;
}

export function getNextAuthSecret(): string | undefined {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value && isProduction()) {
    console.warn('NEXTAUTH_SECRET is not set — sessions will be insecure.');
  }
  return value || (isProduction() ? undefined : 'dev-only-change-me-in-production');
}
