import { DashboardShell } from '@/components/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guards these routes; avoid blocking navigation on session DB lookups.
  return <DashboardShell>{children}</DashboardShell>;
}
