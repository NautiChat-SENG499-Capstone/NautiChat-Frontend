export default function QueryTable() {
  const queries = [
    { id: 1, text: "What is ocean salinity?", date: "2025-06-08" },
    { id: 2, text: "Show me sensor data for Station A", date: "2025-06-09" },
  ];

  return (
    <table className="min-w-full table-auto border-collapse text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2 text-left">ID</th>
          <th className="border px-4 py-2 text-left">Query</th>
          <th className="border px-4 py-2 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {queries.map((q) => (
          <tr key={q.id} className="hover:bg-gray-50">
            <td className="border px-4 py-2">{q.id}</td>
            <td className="border px-4 py-2">{q.text}</td>
            <td className="border px-4 py-2">{q.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
