'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';

type FeedbackEntry = {
  message_id: number;
  input: string;
  response: string;
  feedback: {
    rating: number;
    comment: string;
  };
};

export default function FeedbackPage() {
  const [feedbackData, setFeedbackData] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const perPage = 5;

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Unauthorized: Please log in as an admin.');
      setLoading(false);
      return;
    }

    api.get('/admin/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        // only keep messages with feedback
        const filtered = res.data.filter((msg: FeedbackEntry) => msg.feedback?.rating != null);
        setFeedbackData(filtered);
      })
      .catch((err) => {
        console.error('ERROR:', err);
        setError('Failed to load feedback.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = feedbackData.filter((f) => {
    if (filter === 'positive') return f.feedback.rating >= 4;
    if (filter === 'negative') return f.feedback.rating <= 2;
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

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading feedback...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Query</th>
                <th className="p-3 text-left">Response</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((f) => (
                <tr key={f.message_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{f.input}</td>
                  <td className="p-3 text-gray-700">{f.response}</td>
                  <td className="p-3 text-yellow-600">
                    {f.feedback.rating >= 4
                      ? '👍'
                      : f.feedback.rating <= 2
                      ? '👎'
                      : '😐'}{' '}
                    ({f.feedback.rating})
                  </td>
                  <td className="p-3 text-gray-500">{f.feedback.comment || '-'}</td>
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
      )}

      {!loading && pageCount > 1 && (
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
      )}

      <div className="text-sm text-gray-400 text-center mt-6">
        Showing {paginated.length} of {filtered.length} feedback entries
      </div>
    </AdminLayout>
  );
}
