import React, { useState, useEffect } from 'react';
import { FaFistRaised, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

const BattleManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    neighborhood1: '',
    neighborhood2: '',
    title: '',
    durationDays: 7,
    // Manual Overrides
    manual1: { mtaaIndex: '', waterScore: '', securityScore: '' },
    manual2: { mtaaIndex: '', waterScore: '', securityScore: '' }
  });
  const [loading, setLoading] = useState(false);
  const [battles, setBattles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch Battles on Mount
  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const { data } = await apiClient.get('/battles/all', { withCredentials: true });
      setBattles(data);
    } catch (error) {
      console.error("Failed to fetch battles", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this battle?")) return;
    try {
      await apiClient.delete(`/battles/${id}`, { withCredentials: true });
      toast.success("Battle Deleted");
      fetchBattles();
    } catch (e) { toast.error("Delete Failed"); }
  };

  const handleEdit = (battle) => {
    setEditingId(battle._id);
    setFormData({
      neighborhood1: battle.contenders[0].neighborhood,
      neighborhood2: battle.contenders[1].neighborhood,
      title: battle.title,
      durationDays: 7, // Default
      manual1: battle.contenders[0].statsSnapshot || { mtaaIndex: '', waterScore: '', securityScore: '' },
      manual2: battle.contenders[1].statsSnapshot || { mtaaIndex: '', waterScore: '', securityScore: '' }
    });
    setActiveTab('create');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.neighborhood1 || !formData.neighborhood2) {
      toast.error("Please enter two neighborhoods");
      return;
    }

    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(formData.durationDays));

      const payload = {
        neighborhood1: formData.neighborhood1,
        neighborhood2: formData.neighborhood2,
        title: formData.title || `${formData.neighborhood1} vs ${formData.neighborhood2}`,
        endDate: endDate,
        manualStats1: formData.manual1.mtaaIndex ? formData.manual1 : null,
        manualStats2: formData.manual2.mtaaIndex ? formData.manual2 : null,
      };

      if (editingId) {
        // Update
        await apiClient.put(`/battles/${editingId}`, payload, { withCredentials: true });
        toast.success('Battle Updated');
      } else {
        // Create
        await apiClient.post('/battles/create', payload, { withCredentials: true });
        toast.success('⚔️ Battle Created Successfully!');
      }

      setFormData({ neighborhood1: '', neighborhood2: '', title: '', durationDays: 7, manual1: {}, manual2: {} });
      setEditingId(null);
      fetchBattles();
      setActiveTab('list');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Action Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
            <FaFistRaised size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Battle Command Center</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Launch & Manage Battles</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => { setActiveTab('create'); setEditingId(null); setFormData({ neighborhood1: '', neighborhood2: '', title: '', durationDays: 7, manual1: {}, manual2: {} }); }} className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'create' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Create / Edit</button>
          <button onClick={() => setActiveTab('list')} className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Manage All ({battles.length})</button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Contenders</th>
                <th className="p-3">Votes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {battles.map(b => (
                <tr key={b._id} className="border-b dark:border-gray-700">
                  <td className="p-3 font-medium">{b.title}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${b.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
                  <td className="p-3 text-xs">{b.contenders[0].neighborhood} vs {b.contenders[1].neighborhood}</td>
                  <td className="p-3 font-mono">{b.contenders[0].voteCount + b.contenders[1].voteCount}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b._id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contender 1 */}
            <div className="p-4 border rounded-lg dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
              <h4 className="text-xs font-bold uppercase text-red-600 mb-2">Red Corner (Contender 1)</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Neighborhood Name (e.g. Kileleshwa)"
                  value={formData.neighborhood1}
                  onChange={(e) => setFormData({ ...formData, neighborhood1: e.target.value })}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded p-2 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Mtaa Idx" value={formData.manual1.mtaaIndex} onChange={e => setFormData({ ...formData, manual1: { ...formData.manual1, mtaaIndex: e.target.value } })} className="p-1 text-xs border rounded" />
                  <input type="number" placeholder="Water" value={formData.manual1.waterScore} onChange={e => setFormData({ ...formData, manual1: { ...formData.manual1, waterScore: e.target.value } })} className="p-1 text-xs border rounded" />
                  <input type="number" placeholder="Security" value={formData.manual1.securityScore} onChange={e => setFormData({ ...formData, manual1: { ...formData.manual1, securityScore: e.target.value } })} className="p-1 text-xs border rounded" />
                </div>
                <p className="text-[10px] text-gray-500">Leave stats blank to auto-calculate.</p>
              </div>
            </div>

            {/* Contender 2 */}
            <div className="p-4 border rounded-lg dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
              <h4 className="text-xs font-bold uppercase text-blue-600 mb-2">Blue Corner (Contender 2)</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Neighborhood Name (e.g. Kilimani)"
                  value={formData.neighborhood2}
                  onChange={(e) => setFormData({ ...formData, neighborhood2: e.target.value })}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded p-2 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Mtaa Idx" value={formData.manual2.mtaaIndex} onChange={e => setFormData({ ...formData, manual2: { ...formData.manual2, mtaaIndex: e.target.value } })} className="p-1 text-xs border rounded" />
                  <input type="number" placeholder="Water" value={formData.manual2.waterScore} onChange={e => setFormData({ ...formData, manual2: { ...formData.manual2, waterScore: e.target.value } })} className="p-1 text-xs border rounded" />
                  <input type="number" placeholder="Security" value={formData.manual2.securityScore} onChange={e => setFormData({ ...formData, manual2: { ...formData.manual2, securityScore: e.target.value } })} className="p-1 text-xs border rounded" />
                </div>
                <p className="text-[10px] text-gray-500">Leave stats blank to auto-calculate.</p>
              </div>
            </div>
          </div>

          {/* Title (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Battle Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. The Battle of the Suburbs"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition flex justify-center items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFistRaised />}
            {editingId ? 'Update Battle' : 'Launch Battle'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BattleManager;