import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { FaWallet, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaFileInvoiceDollar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AgentWallet = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper for currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await apiClient.get('/payments/my-transactions');
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedTotal = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <FaWallet className="text-blue-600" />
              My Wallet & Receipts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your payment history and subscription receipts.
            </p>
          </div>
          
          {/* Mini Stat Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(completedTotal)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <FaHistory className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Transaction History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Property</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {format(new Date(txn.createdAt), 'MMM dd, yyyy')}
                        <span className="block text-xs text-gray-400">
                          {format(new Date(txn.createdAt), 'h:mm a')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {txn.productName || "Standard Listing"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {txn.property ? (
                          <Link 
                            to={`/properties/${txn.property.slug}`} 
                            className="text-blue-600 hover:underline dark:text-blue-400 truncate max-w-[200px] block"
                          >
                            {txn.property.title}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">Deleted Property</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${txn.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                            txn.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}
                        >
                          {txn.status === 'completed' && <FaCheckCircle size={10} />}
                          {txn.status === 'failed' && <FaTimesCircle size={10} />}
                          {txn.status === 'pending' && <FaClock size={10} />}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                        {txn.providerTransactionId || txn._id.substring(0, 8) + '...'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <FaFileInvoiceDollar size={40} className="mb-3 opacity-20" />
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm mt-1">You haven't made any payments yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentWallet;