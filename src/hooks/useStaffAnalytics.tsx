'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function useStaffAnalytics<T>(section: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/staff/analytics?section=${section}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.message) setData(json);
      })
      .finally(() => setLoading(false));
  }, [section]);

  return { data, loading };
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Skeleton className="h-[300px] rounded-2xl" />
      <Skeleton className="h-[300px] rounded-2xl" />
    </div>
  );
}
