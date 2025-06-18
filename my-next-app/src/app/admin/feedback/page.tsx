'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

type Feedback = {
  id: number;
  query: string;
  rating: number;
  comment: string;
  date: string;
};

const feedbackData: Feedback[] = [/*...same as before...*/];

export default function FeedbackPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const perPage = 5;

  const filtered = feedbackData.filter((f) => {
    if (filter === 'positive') return f.rating >= 4;
    if (filter === 'negative') return f.rating <= 2;
    return true;
  });

  const pageCount = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">User Feedback</h1>

      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm text-gray-600">
          Filter by feedback type:{' '}
          <select
            onChange={(e) => setFilter(e.target.value as 'all' | 'positive' | 'negative')}
            value={filter}
            className="ml-2 p-1 border rounded-md"
          >
            <option value="all">All</option>
            <option value="positive">👍 Positive</option>
            <option value="negative">👎 Negative</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Query</th>
              <th className="p-3 text-left">Feedback</th>
              <th className="p-3 text-left">Comment</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((f) => (
              <tr key={f.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{f.query}</td>
                <td className="p-3">{f.rating >= 4 ? '👍' : f.rating <= 2 ? '👎' : '😐'}</td>
                <td className="p-3">{f.comment}</td>
                <td className="p-3 text-gray-500">{f.date}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        {[...Array(pageCount)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded-md border ${
              page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-400 text-center mt-6">
        Showing {paginated.length} of {filtered.length} feedback entries
      </div>
    </AdminLayout>
  );
}
