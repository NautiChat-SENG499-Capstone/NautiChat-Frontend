'use client'

import Link from "next/link"
import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-1">
        <span className="text-[1.25rem] font-semibold text-blue-600 hover:underline drop-shadow-sm">
            NautiChat
        </span>
        <span className="relative top-[2px] -ml-[1px] bg-blue-100 text-blue-700 text-[0.65rem] px-2 py-0.5 rounded-full shadow-sm">
            Admin
        </span>
        </Link>

      </nav>
      <main className="max-w-6xl mx-auto py-10 px-4">
        {children}
      </main>
    </div>
  )
}
