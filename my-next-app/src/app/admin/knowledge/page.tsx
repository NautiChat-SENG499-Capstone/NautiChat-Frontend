'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'qa' | 'upload' | 'view'>('qa');

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNav />
      <section className="max-w-6xl mx-auto py-10 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Knowledge Base</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Add questions and answers, upload documents, or view current entries.
          </p>
        </header>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'qa'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            ➕ Add Q&A
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📄 Upload Document
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'view'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            🗂️ View All Entries
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow rounded-xl p-6">
          {activeTab === 'qa' && (
            <form className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Add New Question & Answer</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600">Question</label>
                <input
                  type="text"
                  placeholder="Enter your question"
                  className="w-full border rounded-md p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Answer</label>
                <textarea
                  placeholder="Enter the answer"
                  rows={4}
                  className="w-full border rounded-md p-2 mt-1"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Q&A
              </button>
            </form>
          )}

          {activeTab === 'upload' && (
            <form className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Upload Documents</h2>
              <input type="file" accept=".pdf,.doc,.docx" multiple className="block w-full" />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Upload
              </button>
            </form>
          )}

          {activeTab === 'view' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Existing Knowledge Entries</h2>
              <ul className="text-sm text-gray-600 list-disc ml-5">
                <li>sensor_data_2025.pdf</li>
                <li>common_questions.docx</li>
                <li>What is salinity? – A measurement of dissolved salts in water.</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
