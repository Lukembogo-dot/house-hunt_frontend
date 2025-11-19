import React, { useState } from 'react';
import apiClient from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaCheckCircle, FaTimes } from 'react-icons/fa';

const AskQuestionForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', question: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      await apiClient.post('/faqs/ask', formData);
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', question: '' });
      setTimeout(() => setIsOpen(false), 3000); // Close after success
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || 'Failed to send question.' 
      });
    }
  };

  return (
    <section className="py-12 px-6 bg-blue-50 dark:bg-gray-800/50 border-t border-blue-100 dark:border-gray-700">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Didn't find your answer?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Ask our network of real estate experts and get a personalized response.
        </p>
        
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ask a Question
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 relative text-left"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>

            {status.success ? (
              <div className="text-center py-8">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Question Received!</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  We'll email you as soon as an expert answers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (for notification)</label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Question</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Is it safe to live in Juja near the university?"
                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                  ></textarea>
                </div>
                
                {status.error && <p className="text-red-500 text-sm">{status.error}</p>}

                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {status.loading ? 'Sending...' : <><FaPaperPlane className="mr-2" /> Submit Question</>}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AskQuestionForm;