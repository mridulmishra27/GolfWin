import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getCharities } from '../../api/api';

export default function CharitiesList() {
  const [q, setQ] = useState('');
  const [spotlightOnly, setSpotlightOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');

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
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load charities');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = spotlightOnly ? charities.filter((c) => c?.isSpotlight) : charities;
    if (!needle) return base;
    return base.filter((c) => {
      const name = (c?.name || '').toLowerCase();
      const desc = (c?.description || '').toLowerCase();
      return name.includes(needle) || desc.includes(needle);
    });
  }, [charities, q, spotlightOnly]);

  return (
    <div className="bg-deep-900 min-h-screen font-body text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <header className="flex flex-col gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">Charities</h1>
            <p className="text-gray-400 mt-2">
              Browse verified charities, view profiles, and donate independently.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-surface-border rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search charities..."
              className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              Showing {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No charities found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/charities/${c.id}`}
                className="group rounded-2xl border border-surface-border bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
              >
                <div
                  className="h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${c.image || (c.images && c.images[0]) || ''})`,
                  }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading font-bold text-white text-lg leading-snug">{c.name}</h3>
                    {c.isSpotlight ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                        Spotlight
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                    {c.description || 'Learn more about this organisation.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

