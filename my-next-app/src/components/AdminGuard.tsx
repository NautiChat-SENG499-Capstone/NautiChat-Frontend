'use client';

import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { checking } = useAdminGuard();
  if (checking) return null;

  return <>{children}</>;
}
