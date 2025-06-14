'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

export default function AdminLandingPage() {
  return (
    <AdminLayout>
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Admin control panel for chatbot management</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/admin/queries">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
                <div className="mb-4">
                  <div className="text-xl font-semibold text-blue-600">User Queries</div>
                  <div className="text-sm text-gray-500">Analyze and monitor submitted questions</div>
                </div>
                <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Data preview placeholder
                </div>
              </div>
            </Link>

            <Link href="/admin/feedback">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
                <div className="mb-4">
                  <div className="text-xl font-semibold text-green-600">User Feedback</div>
                  <div className="text-sm text-gray-500">View chatbot ratings and user comments</div>
                </div>
                <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Feedback metrics placeholder
                </div>
              </div>
            </Link>

            <Link href="/admin/knowledge">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
                <div className="mb-4">
                  <div className="text-xl font-semibold text-purple-600">Manage Knowledge Base</div>
                  <div className="text-sm text-gray-500">Add questions, answers, and upload documents</div>
                </div>
                <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Upload summary placeholder
                </div>
              </div>
            </Link>

            <Link href="/chat">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
                <div className="mb-4">
                  <div className="text-xl font-semibold text-indigo-600">Launch NautiChat</div>
                  <div className="text-sm text-gray-500">Open the chatbot interface</div>
                </div>
                <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm">
                  Chatbot preview placeholder
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
