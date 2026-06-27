import { cn } from '@/lib/utils';

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card shadow-sm', className)}>
      {children}
    </div>
  );
}
