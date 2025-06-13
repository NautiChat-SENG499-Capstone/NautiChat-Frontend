import Link from 'next/link';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

export default function AdminLandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/chat" className="text-xl font-semibold text-blue-600 hover:underline">
            NautiChat
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
          <button title="Settings" className="hover:text-gray-800 transition">
            <FiSettings size={20} />
          </button>
          <button title="Profile" className="hover:text-gray-800 transition">
            <FaUserCircle size={22} />
          </button>
          <button
            title="Logout"
            className="text-sm px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Admin control panel for chatbot management</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Queries */}
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

            {/* User Feedback */}
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

            {/* Manage Knowledge Base */}
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

            {/* Launch NautiChat (Chatbot) */}
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
    </main>
  );
}
