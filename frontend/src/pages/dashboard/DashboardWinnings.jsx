import { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Trophy } from 'lucide-react';
import { getWinners, uploadWinnerProof } from '../../api/api';
import { useAuth } from '../../context/AuthContext';


export default function DashboardWinnings() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputsRef = useRef({});

  const fetchWinnings = async () => {
    let mounted = true;
    setLoading(true);
    try {
      const res = await getWinners();
      const list = res?.data?.winners || [];
      if (!mounted) return;
      setWinnings(Array.isArray(list) ? list : []);
    } catch {
      if (!mounted) return;
      setWinnings([]);
    } finally {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    let mounted = true;

    const subscriptionActive = user?.subscriptionStatus === 'active';
    if (!subscriptionActive) {
      setWinnings([]);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);
      try {
        const res = await getWinners();
        const list = res?.data?.winners || [];
        if (!mounted) return;
        setWinnings(Array.isArray(list) ? list : []);
      } catch {
        if (!mounted) return;
        setWinnings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.subscriptionStatus]);

  const triggerFilePicker = (winnerId) => {
    setUploadError('');
    const el = fileInputsRef.current?.[winnerId];
    if (el) el.click();
  };

  const handleProofFile = async (winnerId, file) => {
    if (!file) return;
    setUploadError('');
    setUploadingId(winnerId);
    try {
      const form = new FormData();
      form.append('winnerId', winnerId);
      form.append('proofImage', file);
      await uploadWinnerProof(form);
      const res = await getWinners();
      const list = res?.data?.winners || [];
      setWinnings(Array.isArray(list) ? list : []);
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Proof upload failed. Please try again.');
    } finally {
      setUploadingId(null);
      const el = fileInputsRef.current?.[winnerId];
      if (el) el.value = '';
    }
  };

  const filtered = useMemo(() => {
    return winnings.filter((w) => {
      if (filter === 'pending') return w.status === 'pending';
      if (filter === 'paid') return w.status === 'paid';
      return true;
    });
  }, [winnings, filter]);

  const totalWon = useMemo(() => {
    return winnings.reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);
  }, [winnings]);

  const pending = useMemo(() => {
    return winnings
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);
  }, [winnings]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-center gap-3">
          Winnings overview
          <BadgeCheck size={24} className="text-amber-400" />
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          See every draw you&apos;ve won, how much you&apos;ve earned and payout progress.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold">
            Total won
          </p>
          <p className="text-3xl sm:text-4xl font-heading font-bold text-white mt-1">₹{totalWon.toFixed(2)}</p>
        </div>
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-2 border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full" />
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold relative z-10">
            Pending payouts
          </p>
          <p className="text-3xl sm:text-4xl font-heading font-bold text-amber-400 mt-1 relative z-10">₹{pending.toFixed(2)}</p>
        </div>
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold">
            Payout status
          </p>
          <p className="text-sm text-gray-400 mt-1">
            You&apos;ll see payout references and completion dates here once you win a prize from an entered draw.
          </p>
        </div>
      </section>

      <section className="bento-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
            Winnings history
          </h2>
          <div className="inline-flex rounded-lg bg-[#0f172a] border border-surface-border p-1 w-full sm:w-auto overflow-x-auto">
            {['all', 'pending', 'paid'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md capitalize text-sm transition-colors whitespace-nowrap ${
                  filter === key
                    ? 'bg-electric text-deep-900 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {uploadError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {uploadError}
          </div>
        ) : null}

        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-5 sm:px-0">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-[0.1em] border-b border-surface-border/60">
                  <th className="pb-3 px-2 font-medium">Date</th>
                  <th className="pb-3 px-2 font-medium">Prize</th>
                  <th className="pb-3 px-2 font-medium">Amount</th>
                  <th className="pb-3 px-2 font-medium">Status</th>
                  <th className="pb-3 px-2 font-medium">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Loading winnings...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <div className="bg-[#0f172a] rounded-xl border border-surface-border/50 max-w-md mx-auto py-8 px-4">
                        <Trophy size={32} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-sm">
                          No winnings yet.
                          <br />
                          When you win a draw, details will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.id || w._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 whitespace-nowrap">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-2 font-medium">{w.draw?.month || '—'}</td>
                      <td className="py-4 px-2">{w.matchType || '—'}</td>
                      <td className="py-4 px-2 font-heading font-bold">₹{Number(w.prizeAmount || 0).toFixed(2)}</td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-400">
                        <input
                          ref={(el) => {
                            if (el) fileInputsRef.current[w.id || w._id] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handleProofFile(w.id || w._id, e.target.files?.[0])}
                        />
                        <div className="flex items-center gap-3">
                          {w.proofImage ? (
                            <a
                              href={w.proofImage}
                              target="_blank"
                              rel="noreferrer"
                              className="text-electric hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                          <button
                            type="button"
                            onClick={() => triggerFilePicker(w.id || w._id)}
                            disabled={uploadingId === (w.id || w._id)}
                            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                              uploadingId === (w.id || w._id)
                                ? 'border-surface-border/60 text-gray-500 cursor-not-allowed'
                                : 'border-surface-border/60 text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            {uploadingId === (w.id || w._id)
                              ? 'Uploading...'
                              : w.proofImage
                                ? 'Replace'
                                : 'Upload'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}