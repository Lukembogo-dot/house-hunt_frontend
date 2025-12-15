import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaArrowLeft,
  FaSpinner, FaQuestionCircle, FaLink, FaCheck
} from 'react-icons/fa';

// --- CKEditor Imports ---
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// --- 1. IMAGE UPLOAD ADAPTER (Reused for consistency) ---
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('image', file);
      // Re-using your existing service upload endpoint or you can create a specific one
      apiClient.post('/services/upload-content-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
        .then(response => {
          if (response.data.imageUrl) {
            resolve({ default: response.data.imageUrl });
          } else {
            reject('Image URL not returned from server.');
          }
        })
        .catch(error => {
          reject(error.response?.data?.message || 'Image upload failed.');
        });
    }));
  }
  abort() { }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}
// --------------------------------------------------------

const AdminFaqManager = () => {
  // --- State Management ---
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [saving, setSaving] = useState(false);

  // 'visual' or 'source'
  const [viewMode, setViewMode] = useState('visual');

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    relatedFaqs: [] // Array of IDs
  });

  // --- Fetch FAQs ---
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/faqs'); // Assumes backend route exists
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setStatus({ message: 'Failed to load FAQs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // --- Handlers ---
  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      relatedFaqs: []
    });
    setView('editor');
    setStatus({ message: '', type: '' });
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      relatedFaqs: faq.relatedFaqs ? faq.relatedFaqs.map(f => typeof f === 'object' ? f._id : f) : []
    });
    setView('editor');
    setStatus({ message: '', type: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete the FAQ page and its SEO entry.')) return;
    try {
      await apiClient.delete(`/faqs/${id}`);
      setFaqs(prev => prev.filter(f => f._id !== id));
      setStatus({ message: 'FAQ deleted successfully.', type: 'success' });
    } catch (err) {
      setStatus({ message: 'Failed to delete FAQ.', type: 'error' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      setStatus({ message: 'Question and Answer are required.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update
        await apiClient.put(`/faqs/${editingId}`, formData);
        setStatus({ message: 'FAQ updated successfully!', type: 'success' });
      } else {
        // Create
        await apiClient.post('/faqs', formData);
        setStatus({ message: 'New FAQ created & SEO Page registered!', type: 'success' });
      }

      await fetchFaqs(); // Refresh list
      setTimeout(() => setView('list'), 1500); // Go back to list after success
    } catch (err) {
      setStatus({ message: err.response?.data?.message || 'Failed to save FAQ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRelatedFaq = (id) => {
    setFormData(prev => {
      const exists = prev.relatedFaqs.includes(id);
      if (exists) {
        return { ...prev, relatedFaqs: prev.relatedFaqs.filter(fid => fid !== id) };
      } else {
        return { ...prev, relatedFaqs: [...prev.relatedFaqs, id] };
      }
    });
  };

  // --- Filtering ---
  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs;
    const lowerQ = searchQuery.toLowerCase();
    return faqs.filter(f =>
      f.question.toLowerCase().includes(lowerQ) ||
      f.category.toLowerCase().includes(lowerQ)
    );
  }, [faqs, searchQuery]);

  // --- Editor Config ---
  const editorConfig = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    removePlugins: ['CKBox', 'CKFinder', 'EasyImage'],
    placeholder: 'Write a detailed answer... (This acts as a mini blog post)'
  };

  // ================= RENDER =================
  if (loading && view === 'list' && faqs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaQuestionCircle className="mr-3 text-orange-500" />
            FAQ Hub Manager
          </h1>
          {view === 'list' && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center shadow-lg"
            >
              <FaPlus className="mr-2" /> Create New FAQ
            </button>
          )}
        </div>

        {/* --- STATUS ALERTS --- */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${status.type === 'error'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 border border-red-200'
            : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 border border-green-200'
            }`}>
            {status.message}
          </div>
        )}

        {/* ================= VIEW: LIST ================= */}
        {view === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase font-semibold">
                  <tr>
                    <th className="p-6">Question</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-center">Views</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map(faq => (
                      <tr key={faq._id} className="hover:bg-blue-50 dark:hover:bg-gray-700/30 transition group">
                        <td className="p-6">
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">
                            {faq.question}
                          </p>
                          <span className="text-xs text-gray-400 font-mono">/faq/{faq.slug}</span>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${faq.category === 'Buying' ? 'bg-green-100 text-green-800' :
                            faq.category === 'Renting' ? 'bg-blue-100 text-blue-800' :
                              faq.category === 'Legal' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {faq.category}
                          </span>
                        </td>
                        <td className="p-6 text-center text-gray-500 dark:text-gray-400 font-mono">
                          {faq.views || 0}
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-full transition"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(faq._id)}
                              className="text-red-400 hover:text-red-600 p-2 hover:bg-red-100 rounded-full transition"
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400">
                        No FAQs found. Start building your knowledge hub!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW: EDITOR ================= */}
        {view === 'editor' && (
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Question (H1 Title)
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="e.g., How much is a bedsitter in Kilimani?"
                    className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Detailed Answer (Full Details - HTML Supported)
                    </label>
                    <button
                      type="button"
                      onClick={() => setViewMode(prev => prev === 'visual' ? 'source' : 'visual')}
                      className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      {viewMode === 'visual' ? '</> Edit HTML Source' : '👁️ Visual Preview'}
                    </button>
                  </div>

                  {viewMode === 'visual' ? (
                    <div className="ck-editor-container dark:text-black prose-lg">
                      <CKEditor
                        editor={ClassicEditor}
                        config={editorConfig}
                        data={formData.answer}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData({ ...formData, answer: data });
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full h-80 px-4 py-3 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 text-green-400 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="<!-- Enter raw HTML here (e.g. <h3>Header</h3><p>Content</p>) -->"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Relations */}
            <div className="space-y-6">

              {/* Actions Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white">Publishing</h3>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="General">General</option>
                    <option value="Buying">Buying</option>
                    <option value="Renting">Renting</option>
                    <option value="Legal">Legal</option>
                    <option value="Neighbourhoods">Neighbourhoods</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center shadow-md"
                >
                  {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  {editingId ? 'Update FAQ' : 'Publish FAQ'}
                </button>
              </div>

              {/* Related Questions Linker */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaLink className="mr-2 text-blue-500" /> Related Questions
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Select other FAQs to link at the bottom of this page.
                </p>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {faqs.filter(f => f._id !== editingId).map(f => (
                    <div
                      key={f._id}
                      onClick={() => toggleRelatedFaq(f._id)}
                      className={`p-3 rounded-lg cursor-pointer border transition text-sm flex justify-between items-center ${formData.relatedFaqs.includes(f._id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <span className="line-clamp-2">{f.question}</span>
                      {formData.relatedFaqs.includes(f._id) && <FaCheck className="text-blue-600 flex-shrink-0 ml-2" />}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default AdminFaqManager;