'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';

type Query = {
  message_id: number;
  input: string;
  response: string;
  feedback: {
    rating: number;
    comment: string;
  };
};

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const perPage = 5;

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');

    api.get('/admin/messages', {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setQueries(res.data);
      })
      .catch((err) => {
        console.error('ERROR RESPONSE:', err.response);
        setError('Failed to load queries.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filtered = queries.filter((q) =>
    q.input.toLowerCase().includes(filter.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  return (
    <AdminLayout>
      <section className="max-w-6xl mx-auto py-10 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Queries</h1>
          <p className="text-sm text-gray-600">
            Explore all recent user questions submitted to the chatbot.
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search queries..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-500">Loading queries...</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Query</th>
                  <th className="p-3 text-left">Response</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Comment</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((q) => (
                    <tr key={q.message_id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{q.message_id}</td>
                      <td className="p-3">{q.input}</td>
                      <td className="p-3 text-gray-700">{q.response}</td>
                      <td className="p-3 text-yellow-600">{q.feedback?.rating ?? '-'}</td>
                      <td className="p-3 text-gray-500">{q.feedback?.comment ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No queries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
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

        {!loading && (
          <div className="text-sm text-gray-400 text-center mt-6">
            Showing {paginated.length} of {filtered.length} queries
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
