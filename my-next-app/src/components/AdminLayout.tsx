'use client';

import { ReactNode } from 'react';
import TopNav from './TopNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      <TopNav />
      <main className="max-w-6xl mx-auto py-10 px-4">{children}</main>
    </div>
  );
}
