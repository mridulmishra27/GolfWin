import { useState, useEffect } from 'react';
import { Slider, Track, Range, Thumb } from '@radix-ui/react-slider';
import { Heart } from 'lucide-react';
import { getCharities, selectCharity } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function DashboardCharity() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [percentage, setPercentage] = useState(25);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getCharities();
        const list = res?.data?.charities || [];
        if (!mounted) return;
        setCharities(Array.isArray(list) ? list : []);
        // removed silent setError
        if (!mounted) return;
        toast.error(e.response?.data?.message || e.message || 'Failed to load charities');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user?.charity?.id) setSelectedId(user.charity.id);
    const pct = user?.charityPercentage ?? user?.charity_percentage;
    if (pct != null && pct >= 10 && pct <= 100) setPercentage(pct);
  }, [user?.charity?.id, user?.charityPercentage, user?.charity_percentage]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await selectCharity({
        charityId: selectedId,
        charityPercentage: percentage,
      });
      toast.success('Charity preference saved.');
      await refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-center gap-3">
          Charity & contribution
          <Heart size={24} className="text-rose-400" />
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Choose a cause and set your preferred contribution percentage.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-lg font-heading font-bold text-white mb-2">Select a Charity</h2>
          {loading ? (
            <p className="text-sm text-gray-400 py-8">Loading charities…</p>
          ) : charities.length === 0 ? (
            <p className="text-sm text-gray-400 py-8">No charities available yet.</p>
          ) : (
            charities.map((charity) => {
              const active = charity.id === selectedId;
              const blurb =
                charity.description?.trim() ||
                'Support this organisation through your subscription.';
              return (
                <button
                  key={charity.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(charity.id);
                    setSuccess('');
                  }}
                  className={`w-full text-left rounded-2xl border p-5 transition-all flex flex-col gap-2 ${
                    active
                      ? 'border-electric bg-electric/10 shadow-lg shadow-electric/5'
                      : 'border-surface-border bg-deep-900/40 hover:bg-white/5 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 font-semibold">
                        Registered charity
                      </p>
                      <p className="text-base sm:text-lg font-heading font-semibold text-white truncate">
                        {charity.name}
                      </p>
                    </div>
                    {active ? (
                      <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full bg-electric/20 text-electric border border-electric/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    ) : (
                      <div className="shrink-0 w-5 h-5 rounded-full border border-gray-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed line-clamp-3">{blurb}</p>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-5 bento-card p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold mb-2">
              Contribution
            </p>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
              Charity percentage
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Adjust the share of your subscription allocated directly to your chosen charity (10–100%).
            </p>
          </div>

          <div className="flex items-baseline justify-between bg-[#0f172a] rounded-xl p-5 border border-surface-border">
            <span className="text-5xl font-heading font-bold text-electric">
              {percentage}
              <span className="text-2xl text-gray-400 ml-1">%</span>
            </span>
            <div className="text-right flex flex-col items-end">
              <span className="text-sm text-white font-medium">Prize pool</span>
              <span className="text-xs text-gray-400">{100 - percentage}% remaining</span>
            </div>
          </div>

          <div className="pt-2 pb-2">
            <Slider
              value={[percentage]}
              max={100}
              min={10}
              step={5}
              onValueChange={([v]) => {
                setPercentage(v);
                setSuccess('');
              }}
              className="relative flex w-full touch-none select-none items-center py-2"
              disabled={loading || charities.length === 0}
            >
              <Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-[#0f172a] border border-surface-border">
                <Range className="absolute h-full rounded-full bg-electric" />
              </Track>
              <Thumb
                className="block h-5 w-5 rounded-full border-2 border-electric bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-electric/40"
                aria-label="Charity percentage"
              />
            </Slider>
            <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium px-1">
              <span>10%</span>
              <span>55%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold py-3.5 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            disabled={!selectedId || saving || loading || charities.length === 0}
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </section>
    </div>
  );
}
