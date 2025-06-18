'use client';

import Link from 'next/link';
import { Settings, LogOut, User } from 'lucide-react';

export default function TopNav() {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left side: Logo and Admin badge */}
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-xl font-semibold text-blue-600 hover:underline">
          NautiChat
        </Link>
          <span className="relative -ml-1 translate-y-0.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full shadow-sm">
            Admin
          </span>

      </div>

      {/* Right side: Icons */}
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
