'use client';

import Link from 'next/link';
import { Settings, LogOut, User } from 'lucide-react';

export default function TopNav() {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <Link href="/admin" className="text-2xl font-bold text-blue-600 flex items-center gap-1">
        <span className="hover:underline">NautiChat</span>
        <span className="relative top-[3.5px] bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          Admin
        </span>
      </Link>



      <div className="flex items-center gap-4 text-gray-600">
        <button title="Settings" className="hover:text-gray-800 transition">
          <Settings size={20} />
        </button>
        <button title="Profile" className="hover:text-gray-800 transition">
          <User size={20} />
        </button>
        <button
          title="Logout"
          className="text-sm px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
