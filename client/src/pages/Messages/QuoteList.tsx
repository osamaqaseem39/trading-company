import React, { useEffect, useState } from 'react';
import { quoteApi, Quote } from '../../services/api';
import PageMeta from "../../components/common/PageMeta";

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await quoteApi.getAll();
      setMessages(res.data);
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await quoteApi.update(id, { status });
      setMessages((prev) => prev.map(q => q._id === id ? { ...q, status } : q));
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PageMeta
        title="Message Requests"
        description="Manage customer message requests and their status."
      />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Message Requests</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Details</th>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((q) => (
                <tr key={q._id} className="border-t">
                  <td className="px-4 py-2 border font-medium">{q.name}</td>
                  <td className="px-4 py-2 border">{q.email}</td>
                  <td className="px-4 py-2 border">{q.phone}</td>
                  <td className="px-4 py-2 border max-w-xs truncate" title={q.details}>{q.details}</td>
                  <td className="px-4 py-2 border">
                    {q.image ? (
                      <a href={q.image} target="_blank" rel="noopener noreferrer">
                        <img src={q.image} alt="Message" className="w-16 h-16 object-cover rounded shadow" />
                      </a>
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    <select
                      value={q.status}
                      onChange={e => handleStatusChange(q._id, e.target.value)}
                      className="px-2 py-1 rounded border text-xs font-semibold"
                      disabled={updatingId === q._id}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border text-xs text-gray-500">{new Date(q.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </>
  );
};

export default MessageList; 