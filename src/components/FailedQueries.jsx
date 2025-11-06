import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { FaSync, FaTrash } from 'react-icons/fa';
import TeachBotModal from './TeachBotModal'; // ✅ 1. Import the new modal

const FailedQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ 2. State to manage the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await apiClient.get('/ai/failed-queries', {
        withCredentials: true,
      });
      setQueries(data);
    } catch (err) {
      setError('Failed to fetch failed queries.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ 3. Handler to open the modal
  const handleTeachClick = (query) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };
  
  // ✅ 4. Handler to close modal and refresh list
  const handleSynonymCreated = () => {
    fetchQueries(); // Refresh the list
  };

  // ✅ 5. Handler to delete a query without teaching
  const handleDeleteQuery = async (queryId) => {
    if (window.confirm("Are you sure you want to delete this query? This is for queries that are just spam.")) {
      try {
        await apiClient.delete(`/ai/failed-queries/${queryId}`, {
          withCredentials: true,
        });
        fetchQueries(); // Refresh list
      } catch (err) {
        alert("Failed to delete query.");
      }
    }
  };

  return (
    <>
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold dark:text-gray-100">
            Bot Learning (Failed Queries)
          </h2>
          <button
            onClick={fetchQueries}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-500 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
          {loading ? (
            <p className="dark:text-gray-300 text-center p-4">Loading queries...</p>
          ) : error ? (
            <p className="text-red-500 text-center p-4">{error}</p>
          ) : queries.length === 0 ? (
            <p className="dark:text-gray-300 text-center p-4">
              No failed queries logged yet. Your bot is perfect!
            </p>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">
                    Failed Query (What the user asked)
                  </th>
                  <th className="p-3 text-left dark:text-gray-300">Times Asked</th>
                  <th className="p-3 text-left dark:text-gray-300">Last Asked</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr
                    key={q._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-3 dark:text-gray-200 font-mono">
                      "{q.queryText}"
                    </td>
                    <td className="p-3 dark:text-gray-200 text-center">{q.count}</td>
                    <td className="p-3 dark:text-gray-200 text-sm">
                      {formatDate(q.lastAsked)}
                    </td>
                    <td className="p-3 flex space-x-3">
                      {/* ✅ 6. Hook up the "Teach Bot" button */}
                      <button 
                        onClick={() => handleTeachClick(q)}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Teach Bot
                      </button>
                      <button
                        onClick={() => handleDeleteQuery(q._id)}
                        className="text-red-500 text-sm hover:underline"
                        title="Delete (Don't teach)"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Use "Teach Bot" to add a new rule. The bot will learn it, and this query will be removed.
        </p>
      </section>

      {/* ✅ 7. Render the modal if it's open */}
      {isModalOpen && selectedQuery && (
        <TeachBotModal
          query={selectedQuery}
          onClose={() => setIsModalOpen(false)}
          onSynonymCreated={handleSynonymCreated}
        />
      )}
    </>
  );
};

export default FailedQueries;