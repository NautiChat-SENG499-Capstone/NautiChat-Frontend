'use client';

import { useState } from 'react';

export default function KnowledgeManager() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [documents, setDocuments] = useState<FileList | null>(null);

  const handleQASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send question and answer to backend
    console.log('Submitting QA:', { question, answer });
    setQuestion('');
    setAnswer('');
  };

  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: upload documents to backend
    if (documents) {
      console.log('Uploading documents:', documents);
      setDocuments(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Add Q&A Form */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Add New Q&A</h2>
        <form onSubmit={handleQASubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Q&A
          </button>
        </form>
      </section>

      {/* Upload Documents */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Upload Documents</h2>
        <form onSubmit={handleDocUpload} className="space-y-4">
          <input
            type="file"
            multiple
            onChange={(e) => setDocuments(e.target.files)}
            className="block w-full text-sm text-gray-600"
            accept=".pdf,.doc,.docx"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Upload Files
          </button>
        </form>
      </section>

      {/* Mocked List of Uploaded Items */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Uploaded Items (Mocked)</h2>
        <ul className="list-disc ml-5 text-sm text-gray-600">
          <li>sensor_data_2025.pdf</li>
          <li>common_questions.docx</li>
          <li>ocean_faq.pdf</li>
        </ul>
      </section>
    </div>
  );
}
