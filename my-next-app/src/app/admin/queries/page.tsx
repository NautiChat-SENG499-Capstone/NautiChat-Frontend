'use client';

import { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

type Query = {
  id: number;
  text: string;
  date: string;
};

const allQueries: Query[] = [
  { id: 1, text: 'What is ocean salinity?', date: '2025-06-07' },
  { id: 2, text: 'Show water temperature at Station A.', date: '2025-06-06' },
  { id: 3, text: 'How deep is the Juan de Fuca ridge?', date: '2025-06-05' },
  { id: 4, text: 'Export data from Station B in CSV.', date: '2025-06-04' },
  { id: 5, text: 'How often are sensors calibrated?', date: '2025-06-03' },
  { id: 6, text: 'What causes salinity changes?', date: '2025-06-02' },
  { id: 7, text: 'Is the ocean pH rising or falling?', date: '2025-06-01' },
  { id: 8, text: 'What are hydrothermal vents?', date: '2025-05-31' },
  { id: 9, text: 'Compare temperature at Station A and C.', date: '2025-05-30' },
  { id: 10, text: 'Show latest seismic activity.', date: '2025-05-29' },
  { id: 11, text: 'How many sensors are deployed?', date: '2025-05-28' },
  { id: 12, text: 'Where is the highest salinity?', date: '2025-05-27' },
  { id: 13, text: 'Can I see live ocean camera feeds?', date: '2025-05-26' },
  { id: 14, text: 'What is water turbidity?', date: '2025-05-25' },
  { id: 15, text: 'Station D is offline — why?', date: '2025-05-24' },
  { id: 16, text: 'Find nitrate levels at Station E.', date: '2025-05-23' },
  { id: 17, text: 'Why does ocean data vary seasonally?', date: '2025-05-22' },
  { id: 18, text: 'How do you calculate salinity?', date: '2025-05-21' },
  { id: 19, text: 'Are there anomalies in temperature readings?', date: '2025-05-20' },
  { id: 20, text: 'Explain the data gaps in Station F.', date: '2025-05-19' },
];

export default function QueriesPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const perPage = 5;

  const filtered = allQueries.filter((q) =>
    q.text.toLowerCase().includes(filter.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  useEffect(() => {
    setPage(1); // reset to page 1 when filter changes
  }, [filter]);

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNav />
      <section className="max-w-6xl mx-auto py-10 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Queries</h1>
          <p className="text-sm text-gray-600">Explore all recent user questions submitted to the chatbot.</p>
        </header>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search queries..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Query Table */}
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Query</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{q.id}</td>
                    <td className="p-3">{q.text}</td>
                    <td className="p-3 text-gray-500">{q.date}</td>
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

        {/* Pagination */}
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

        {/* Footer note */}
        <div className="text-sm text-gray-400 text-center mt-6">
          Showing {paginated.length} of {filtered.length} queries
        </div>
      </section>
    </main>
  );
}
