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

const feedbackData: Feedback[] = [
  { id: 1, query: 'What is the sea level?', rating: 5, comment: 'Great!', date: '2025-06-01' },
  { id: 2, query: 'Show Station B data.', rating: 2, comment: 'Missing info', date: '2025-06-02' },
  { id: 3, query: 'What is a hydrophone?', rating: 1, comment: 'No answer', date: '2025-06-03' },
  { id: 4, query: 'Can I download sensor data?', rating: 4, comment: 'Would like CSV export.', date: '2025-06-04' },
  { id: 5, query: 'Where are underwater cameras located?', rating: 5, comment: 'Super helpful!', date: '2025-06-05' },
  { id: 6, query: 'What is oxygen saturation?', rating: 3, comment: 'Mediocre explanation.', date: '2025-06-06' },
  { id: 7, query: 'Show latest readings for Station C.', rating: 2, comment: 'Wrong station returned.', date: '2025-06-07' },
  { id: 8, query: 'How often are sensors calibrated?', rating: 4, comment: 'Answered well.', date: '2025-06-08' },
  { id: 9, query: 'Why is salinity changing?', rating: 5, comment: 'Great answer with details!', date: '2025-06-09' },
  { id: 10, query: 'What species are in the deep sea?', rating: 3, comment: 'Okay, but vague.', date: '2025-06-10' },
  { id: 11, query: 'Why is Station D offline?', rating: 1, comment: 'Didn’t explain outage.', date: '2025-06-11' },
  { id: 12, query: 'Export data in JSON.', rating: 2, comment: 'Not possible?', date: '2025-06-12' },
  { id: 13, query: 'What is the water temperature range?', rating: 4, comment: 'Pretty accurate.', date: '2025-06-13' },
];

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
      <section className="max-w-6xl mx-auto py-10 px-4">
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
                  <td className="p-3">
                    {f.rating >= 4 ? '👍' : f.rating <= 2 ? '👎' : '😐'}
                  </td>
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
                page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-400 text-center mt-6">
          Showing {paginated.length} of {filtered.length} feedback entries
        </div>
      </section>
    </AdminLayout>
  );
}
