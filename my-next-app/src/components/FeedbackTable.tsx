export default function FeedbackTable() {
  const feedbackList = [
    {
      id: 1,
      query: 'What is the average sea level this year?',
      rating: 5,
      comment: 'Very helpful!',
      date: '2025-06-08',
    },
    {
      id: 2,
      query: 'Show me water temperature for Station A',
      rating: 2,
      comment: 'Did not return expected data.',
      date: '2025-06-07',
    },
    {
      id: 3,
      query: 'What are hydrophone results?',
      rating: 1,
      comment: 'No answer found.',
      date: '2025-06-06',
    },
  ];

  return (
    <table className="min-w-full table-auto border-collapse text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2 text-left">Query</th>
          <th className="border px-4 py-2 text-left">Rating</th>
          <th className="border px-4 py-2 text-left">Comment</th>
          <th className="border px-4 py-2 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {feedbackList.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="border px-4 py-2">{item.query}</td>
            <td className="border px-4 py-2">{item.rating}</td>
            <td className="border px-4 py-2">{item.comment}</td>
            <td className="border px-4 py-2">{item.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
