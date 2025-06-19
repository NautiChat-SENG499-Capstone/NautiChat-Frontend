'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';

type FeedbackEntry = {
  id: number;
  query: string;
  response: string;
  rating: number;
  comment: string;
  date: string;
};

export default function FeedbackPage() {
  const pathname = usePathname();
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const perPage = 5;

  const fetchFeedback = () => {
    setLoading(true);
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setError('Unauthorized: Please log in as an admin.');
      setLoading(false);
      return;
    }

    api
      .get('/admin/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        const entries = res.data
          .filter((msg: any) => msg.feedback && msg.feedback.rating !== undefined)
          .map((msg: any) => ({
            id: msg.message_id,
            query: msg.input,
            response: msg.response,
            rating: msg.feedback.rating,
            comment: msg.feedback.comment,
            date: new Date(msg.timestamp || msg.created_at || '').toLocaleDateString(),
          }));
        setFeedback(entries);
      })
      .catch((err) => {
        console.error('ERROR RESPONSE:', err.response);
        if (err.response?.status === 401) {
          setError('Unauthorized: Invalid or expired token.');
        } else {
          setError('Failed to load feedback.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedback();
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFeedback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const filtered = feedback.filter((f) => {
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

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

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
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((f) => (
                    <tr key={f.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{f.query}</td>
                      <td className="p-3">{f.response}</td>
                      <td className="p-3">{f.rating}</td>
                      <td className="p-3">{f.comment}</td>
                      <td className="p-3 text-gray-500">{f.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No feedback found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
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
      </section>
    </AdminLayout>
  );
}
