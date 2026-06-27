'use client';

import { useTheme } from 'next-themes';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    isDark,
    grid: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
    gridStrong: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    polar: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
    axis: isDark ? '#94a3b8' : '#94A3B8',
  };
}
