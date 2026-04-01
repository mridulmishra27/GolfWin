import { useState, useEffect, useCallback } from 'react';
import { getScores, addScore } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function DashboardScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    roundScore: '',
  });

  const fetchScores = useCallback(async () => {
    try {
      const response = await getScores();
      const data = response?.data?.scores || [];

      const normalised = Array.isArray(data)
        ? data.map((item) => ({
            date: item.date || item.playedAt || '',
            roundScore: item.roundScore ?? item.score ?? '',
          }))
        : [];

      const sorted = normalised
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setScores(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load scores');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    fetchScores().finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [fetchScores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.subscriptionStatus !== 'active') {
      toast.error('An active subscription is required to save scores.');
      return;
    }
    if (!form.date || !form.roundScore) return;

    try {
      setError('');
      await addScore({
        score: Number(form.roundScore),
        date: form.date,
      });

      // Re-fetch from server so the table is always in sync
      await fetchScores();
      toast.success('Score saved successfully!');

      setForm({ date: new Date().toISOString().split('T')[0], roundScore: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save score');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Scores</h1>
          <p className="text-sm text-gray-400">
            Log your latest golf scores.
          </p>
        </div>
      </header>

      {user?.subscriptionStatus !== 'active' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your subscription is currently {user?.subscriptionStatus || 'inactive'}. Renew or subscribe to access score tracking.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ADD / UPDATE SCORE CARD */}
        <div className="lg:col-span-5 bento-card p-5 sm:p-6 h-fit cursor-default">
          <h2 className="text-lg font-bold text-white mb-6">Add / Update Score</h2>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Score (Stableford)</label>
              <input
                type="number"
                name="roundScore"
                min="1"
                max="45"
                value={form.roundScore}
                onChange={handleChange}
                placeholder="e.g., 36"
                className="w-full bg-[#0f172a] border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={user?.subscriptionStatus !== 'active'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={user?.subscriptionStatus !== 'active'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={user?.subscriptionStatus !== 'active'}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-emerald-500/10"
            >
              Save Score
            </button>
          </form>
        </div>

        {/* YOUR SCORES CARD */}
        <div className="lg:col-span-7 bento-card p-5 sm:p-6 cursor-default">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Your Scores</h2>
            <span className="text-sm text-gray-400">{scores.length} / 5 scores</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-surface-border/60 text-gray-400">
                  <th className="pb-3 font-medium px-2">Date</th>
                  <th className="pb-3 font-medium px-2">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-gray-400">
                      Loading scores...
                    </td>
                  </tr>
                ) : scores.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-gray-400">
                      No scores added yet.
                    </td>
                  </tr>
                ) : (
                  scores.map((score, index) => (
                    <tr key={`${score.date}-${index}`} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2">
                        {new Date(score.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-2">
                        <div className="bg-[#0f172a] border border-surface-border rounded-md px-4 py-1.5 inline-block text-center font-medium">
                          {score.roundScore}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}