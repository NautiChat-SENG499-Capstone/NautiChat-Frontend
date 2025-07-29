'use client';

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import AdminGuard from '@/components/AdminGuard';

type Query = {
  message_id: number;
  input: string;
  response: string;
  rating: number;
};

// ✅ Cache outside the component
let cachedQueries: Query[] | null = null;

export default function FeedbackPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'up' | 'down'>('all');
  const isFetching = useRef(false);

  // ✅ Public method to load (with optional force refresh)
  const fetchQueries = (forceRefresh = false) => {
    if (cachedQueries && !forceRefresh) {
      setQueries(cachedQueries);
      setLoading(false);
      return;
    }

    runFullFetch(forceRefresh);
  };

  // ✅ Does the actual API call and comparison
  const runFullFetch = (isRefresh = false) => {
    if (isFetching.current) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    isFetching.current = true;
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setError('Unauthorized: Please log in as an admin.');
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
      return;
    }

    api
      .get('/admin/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        const stripped = res.data
          .filter((msg: any) => msg.feedback && msg.feedback.rating !== undefined)
          .map((msg: any) => ({
            message_id: msg.message_id,
            input: msg.input,
            response: msg.response,
            rating: msg.feedback.rating,
          }));

        const isChanged = JSON.stringify(stripped) !== JSON.stringify(cachedQueries);
        if (isChanged) {
          cachedQueries = stripped;
          setQueries(stripped);
        }
      })
      .catch((err) => {
        console.error('ERROR RESPONSE:', err.response || err);
        if (err.response?.status === 401) {
          setError('Unauthorized: Invalid or expired token.');
        } else {
          setError('Failed to load queries.');
        }
      })
      .finally(() => {
        isFetching.current = false;
        setLoading(false);
        setRefreshing(false);
      });
  };

  // ✅ Load on first mount
  useEffect(() => {
    fetchQueries();
  }, []);

  // ✅ Refresh if user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        cachedQueries = null;
        fetchQueries(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const filtered = queries
    .filter((q) => q.input.toLowerCase().includes(filter.toLowerCase()))
    .filter((q) => {
      if (ratingFilter === 'up') return q.rating === 2;
      if (ratingFilter === 'down') return q.rating === 1;
      return true;
    });

  return (
    <AdminGuard>
      <AdminLayout>
        <section className="w-full max-w-screen-xl mx-auto py-4 px-6">
          <div className="ml-[-33px]">
            <header className="mb-2">
              <h1 className="text-2xl font-bold text-gray-800">User Feedback</h1>
              <p className="text-sm text-gray-600">
                Explore all user feedback submitted to the chatbot.
              </p>
            </header>

            {/* Filter Input */}
            <div className="mb-3 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search queries..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-80 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Feedback Type Filter */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-600">
                Filter by feedback type:{' '}
                <select
                  onChange={(e) =>
                    setRatingFilter(e.target.value as 'all' | 'up' | 'down')
                  }
                  value={ratingFilter}
                  className="ml-2 p-1 border rounded-md"
                >
                  <option value="all">All</option>
                  <option value="up">Positive👍</option>
                  <option value="down">Negative👎</option>
                </select>
              </label>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  cachedQueries = null;
                  fetchQueries(true);
                }}
                disabled={refreshing}
                className={`text-sm px-3 py-1 rounded transition ${
                  refreshing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {refreshing ? 'Refreshing…' : '🔄 Refresh'}
              </button>
            </div>

            {/* Error Message */}
            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            {/* Table */}
            {loading ? (
              <p className="text-center text-gray-500">Loading queries...</p>
            ) : (
              <div className="w-[1300px] mx-auto bg-white shadow rounded-xl">
                <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="w-12 p-3 text-left">#</th>
                        <th className="w-1/3 p-3 text-left">Query</th>
                        <th className="w-2/3 p-3 text-left pl-[87px]">Response</th>
                        <th className="w-1/6 p-3 text-left">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((q) => (
                          <tr key={q.message_id} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-gray-500">{q.message_id}</td>
                            <td className="p-3 truncate" title={q.input}>
                              {q.input}
                            </td>
                            <td
                              className="p-3 truncate text-gray-800 pl-[87px]"
                              title={q.response}
                            >
                              {q.response.length > 100
                                ? q.response.slice(0, 100) + '...'
                                : q.response}
                            </td>
                            <td className="p-3 text-gray-700">
                              {q.rating === 2 ? '👍' : q.rating === 1 ? '👎' : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-400">
                            No queries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            {!loading && (
              <div className="text-sm text-gray-400 text-center mt-3">
                Showing all {filtered.length} queries
              </div>
            )}
          </div>
        </section>
      </AdminLayout>
    </AdminGuard>
  );
}
