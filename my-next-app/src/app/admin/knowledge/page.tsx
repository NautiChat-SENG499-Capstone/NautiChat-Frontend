'use client';

import { useState } from 'react';
import { useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';




export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'qa' | 'upload' | 'view'>('qa');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Knowledge Base</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 rounded-md text-sm font-medium tsransition ${
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

 {/* Content */}
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Upload Documents</h2>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            console.log('📁 Files selected:');
            Array.from(files).forEach((file) => {
              console.log('—', file.name);
            });
          } else {
            console.log('⚠️ No files selected.');
          }
        }}
        className="hidden"
      />

          {/* Upload button triggers file input */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Upload
          </button>
        </div>
      )}
    </div>



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
    </AdminLayout>
  );
}
