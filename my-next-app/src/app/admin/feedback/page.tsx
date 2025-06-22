'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';

type Query = {
  message_id: number;
  input: string;
  response: string;
  rating: number;
};

export default function FeedbackPage() {
  const pathname = usePathname();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'up' | 'down'>('all');


  const isFetching = useRef(false);

  const fetchQueries = () => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setError('Unauthorized: Please log in as an admin.');
      setLoading(false);
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
        setQueries(stripped);
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
      });
  };

  useEffect(() => {
    fetchQueries();
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchQueries();
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
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-gray-600">
            Filter by feedback type:{' '}
            <select
              onChange={(e) => setRatingFilter(e.target.value as 'all' | 'up' | 'down')}
              value={ratingFilter}
              className="ml-2 p-1 border rounded-md"
            >
              <option value="all">All</option>
              <option value="up">Positive👍</option>
              <option value="down">Negative👎</option>
            </select>
          </label>
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
                      <td className="p-3 truncate text-gray-800 pl-[87px]" title={q.response}>
                        {q.response.length > 100 ? q.response.slice(0, 100) + '...' : q.response}
                      </td>
                      <td className="p-3 text-gray-700">{q.rating}</td>
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
  );
}
