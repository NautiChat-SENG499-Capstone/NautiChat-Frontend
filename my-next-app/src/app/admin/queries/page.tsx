'use client';

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import AdminGuard from '@/components/AdminGuard';
import styles from '@/components/QueryPopup.module.css';


type Query = {
  message_id: number;
  input: string;
  response: string;
};

let cachedQueries: Query[] | null = null;

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const isFetching = useRef(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [position, setPosition] = useState({ x: 1000, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchQueries = (forceRefresh = false) => {
    if (cachedQueries && !forceRefresh) {
      setQueries(cachedQueries);
      setLoading(false);
      return;
    }

    runFullFetch(forceRefresh);
  };

  const runFullFetch = (isRefresh = false) => {
    if (isFetching.current) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
        const stripped = res.data.map((msg: any) => ({
          message_id: msg.message_id,
          input: msg.input,
          response: msg.response,
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

  useEffect(() => {
    fetchQueries();
  }, []);

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

  // Close on background click only (not on popup)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedQuery && popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedQuery(null);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [selectedQuery]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };


  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove(styles.dragging);
  };


    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const filtered = queries.filter((q) =>
    q.input.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AdminGuard>
      {selectedQuery && (
        <div
          ref={popupRef}
          className={`fixed z-50 bg-white border border-gray-300 shadow-xl rounded-lg p-5 transition-all cursor-default ${styles.resizable}`}
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: '420px',
            minHeight: '180px',
            maxHeight: '600px',
          }}
        >

          <div
            className="flex justify-between items-center mb-3 cursor-move"
            onMouseDown={(e) => {
              dragOffset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
              };
              setIsDragging(true);
              document.body.classList.add(styles.dragging);
            }}


          >
            <h2 className="text-lg font-semibold text-gray-800">Query #{selectedQuery.message_id}</h2>
            <button
              onClick={() => setSelectedQuery(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-1">User Question:</p>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedQuery.input}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Chatbot Response:</p>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedQuery.response}</p>
          </div>
        </div>
      )}

      <AdminLayout>
        <section className="w-full max-w-screen-xl mx-auto py-4 px-6">
          <div className="ml-[-33px]">
            <header className="mb-2">
              <h1 className="text-2xl font-bold text-gray-800">User Queries</h1>
              <p className="text-sm text-gray-600">
                Explore all recent user questions submitted to the chatbot.
              </p>
            </header>

            <div className="mb-3 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search queries..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-80 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            <div className="flex justify-end mb-2 mr-116">
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
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((q) => (
                          <tr
                            key={q.message_id}
                            className="border-t hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuery((prev) =>
                                prev?.message_id === q.message_id ? null : q
                              );
                            }}
                          >
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-400">
                            No queries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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