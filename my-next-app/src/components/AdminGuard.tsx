'use client';

import { useAdminGuard } from '@/hooks/useAdminGuard';
import Link from 'next/link';


export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { checking, isAuthorized } = useAdminGuard();
  if (checking) return null;

  if (!isAuthorized) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600 font-semibold mb-4">You are not authorized to view this page.</p>
        <Link
          href="/chat"
          className="text-blue-600 underline hover:text-blue-800 transition"
        >
          Go back to Chatbot
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
