import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dice5, Play, Eye, Zap, Clock } from 'lucide-react';
import { getCurrentDraw, getDrawHistory, createDraftDraw, simulateDraw, publishDraw, runDraw } from '../../api/api';
import { GlowButton } from '../../components/admin/AdminUi';

import { toast } from 'react-toastify';

export default function AdminDraw() {
  const [draw, setDraw] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [running, setRunning] = useState(false);
  const [drawType, setDrawType] = useState('random');

  const fetchData = () => Promise.allSettled([
    getCurrentDraw().then(r => setDraw(r.data.draw || r.data)),
    getDrawHistory().then(r => setHistory(r.data.draws || r.data || [])),
  ]).finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  const handleDraft = async () => {
    setDrafting(true);
    try {
      const payload = { type: drawType };
      const res = await createDraftDraw(payload);
      setDraw(res.data.draw || res.data);
      toast.success('Draft draw created!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create draft');
    } finally { setDrafting(false); }
  };

  const handleSimulate = async () => {
    if (!draw?.id) return;
    setSimulating(true);
    try {
      const res = await simulateDraw(draw.id);
      setDraw(res.data.draw || draw);
      toast.success('Simulation complete — check results');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed');
    } finally { setSimulating(false); }
  };

  const handlePublish = async () => {
    if (!draw?.id) return;
    setPublishing(true);
    try {
      await publishDraw(draw.id);
      toast.success('Draw published! 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    } finally { setPublishing(false); }
  };

  const handleRunDraw = async () => {
    setRunning(true);
    try {
      const payload = { type: drawType };
      await runDraw(payload);
      toast.success('Draw created and published! 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Run failed');
    } finally { setRunning(false); }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">

  {/* HEADER */}
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h1 className="text-3xl font-bold">Draw Control</h1>
    <p className="text-gray-400 text-sm mt-1">
      Create, simulate and publish draws
    </p>
  </motion.div>

  {/* MAIN GRID */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

    {/* LEFT: CONTROLS */}
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-1 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5"
    >
      <h3 className="font-semibold text-lg">Create Draw</h3>

      {/* TYPE SELECT */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Draw Type</p>
        <div className="grid grid-cols-2 gap-2">
          {['random', 'algorithm'].map((t) => (
            <button
              key={t}
              onClick={() => setDrawType(t)}
              className={`py-2 rounded-lg text-xs font-medium border transition ${
                drawType === t
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-2">
        <GlowButton onClick={handleDraft} loading={drafting}>
          <Dice5 size={16} /> Create Draft
        </GlowButton>

        <GlowButton
          variant="ghost"
          onClick={handleSimulate}
          loading={simulating}
          disabled={!draw || draw?.status === 'published'}
        >
          <Eye size={16} /> Simulate
        </GlowButton>

        <GlowButton
          variant="green"
          onClick={handlePublish}
          loading={publishing}
          disabled={!draw || draw?.status === 'published'}
        >
          <Play size={16} /> Publish
        </GlowButton>

        <div className="border-t border-white/10 my-2" />

        <GlowButton
          onClick={handleRunDraw}
          loading={running}
          className="bg-gradient-to-r from-orange-500 to-red-500"
        >
          <Zap size={16} /> Quick Run
        </GlowButton>
      </div>
    </motion.div>

    {/* RIGHT: CURRENT DRAW */}
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-2 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Current Draw</h3>

        {draw && (
          <span
            className={`px-3 py-1 text-xs rounded-full border ${
              draw.status === 'published'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}
          >
            {draw.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
      ) : draw ? (
        <>
          {/* NUMBERS */}
          <div>
            <p className="text-xs text-gray-400 mb-2">
              Numbers ({draw.month})
            </p>
            <div className="flex gap-2 flex-wrap">
              {(draw.numbers || []).map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-400/20 font-semibold"
                >
                  {n}
                </motion.div>
              ))}
            </div>
          </div>

          {/* META GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Pool', value: `₹${(draw.totalPool || 0).toFixed(2)}` },
              { label: 'Users', value: draw.subscriberCount || 0 },
              { label: 'Carry', value: `₹${(draw.jackpotCarryForward || 0).toFixed(2)}` },
              { label: 'Type', value: draw.type || 'random' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <p className="text-[11px] text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className="font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
          <Dice5 size={30} className="mx-auto mb-2 opacity-30" />
          <p className="text-gray-500 text-sm">
            No draw created yet
          </p>
        </div>
      )}
    </motion.div>
  </div>

  {/* HISTORY */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
  >
    <h3 className="font-semibold text-lg mb-4">Draw History</h3>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400 text-xs border-b border-white/10">
          <tr>
            <th className="text-left py-2">Month</th>
            <th>Numbers</th>
            <th>Status</th>
            <th>Pool</th>
            <th>Users</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                No history yet
              </td>
            </tr>
          ) : (
            history.map((d) => (
              <tr
                key={d.id || d._id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="py-3 font-medium">{d.month}</td>

                <td>
                  <div className="flex gap-1">
                    {(d.numbers || []).map((n, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded bg-blue-500/10 border border-blue-400/20"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </td>

                <td>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      d.status === 'published'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </td>

                <td className="text-orange-400 font-medium">
                  ₹{(d.totalPool || 0).toFixed(2)}
                </td>

                <td>{d.subscriberCount || 0}</td>

                <td className="text-blue-400 text-xs">{d.type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </motion.div>
</div>
  );
}