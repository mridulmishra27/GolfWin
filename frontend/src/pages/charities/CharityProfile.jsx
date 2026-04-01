import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { createDonationCheckout, getCharity } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function CharityProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [charity, setCharity] = useState(null);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getCharity(id);
        if (!mounted) return;
        setCharity(res?.data?.charity || null);
      } catch (e) {
        if (!mounted) return;
        toast.error(e?.response?.data?.message || e?.message || 'Failed to load charity');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const images = charity?.images?.length
    ? charity.images
    : charity?.image
      ? [charity.image]
      : [];

  const events = Array.isArray(charity?.events) ? charity.events : [];

  const startDonation = async () => {
    if (!user) {
      setError('Please log in to donate.');
      return;
    }
    const amt = Number(donationAmount);
    if (!amt || Number.isNaN(amt) || amt <= 0) {
      setError('Enter a valid donation amount.');
      return;
    }
    setDonating(true);
    setError('');
    try {
      const res = await createDonationCheckout(charity.id, { amount: amt });
      const url = res?.data?.checkoutUrl;
      if (url) window.location.href = url;
      else setError('Unable to start donation checkout.');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Donation checkout failed.');
    } finally {
      setDonating(false);
    }
  };

  return (
    <div className="bg-deep-900 min-h-screen font-body text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link to="/charities" className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
          <ArrowLeft size={16} /> Back to charities
        </Link>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        ) : !charity ? (
          <div className="mt-10 text-gray-400">Charity not found.</div>
        ) : (
          <>
            <header className="mt-8 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">{charity.name}</h1>
                  <p className="text-gray-400 mt-2 max-w-2xl">
                    {charity.description || 'No description provided yet.'}
                  </p>
                </div>
                {charity.isSpotlight ? (
                  <span className="shrink-0 text-[10px] px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                    Spotlight
                  </span>
                ) : null}
              </div>
            </header>

            <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-surface-border bg-white/5 overflow-hidden">
                  {images.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                      {images.slice(0, 4).map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`${charity.name} ${i + 1}`}
                          className="w-full h-52 object-cover rounded-xl"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center text-gray-500">
                      <ImageIcon size={22} className="mr-2" /> No images yet
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-surface-border bg-white/5 p-6">
                  <h2 className="text-lg font-heading font-bold text-white mb-3">Upcoming events</h2>
                  {events.length === 0 ? (
                    <p className="text-sm text-gray-400">No upcoming events listed.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((ev, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-surface-border bg-[#0f172a] p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-white font-semibold truncate">{ev.title}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <CalendarDays size={14} className="text-electric" />
                                {ev.date}
                              </p>
                            </div>
                            {ev.link ? (
                              <a
                                href={ev.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-electric hover:underline shrink-0"
                              >
                                Details
                              </a>
                            ) : null}
                          </div>
                          {ev.description ? (
                            <p className="text-sm text-gray-400 mt-3">{ev.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="lg:col-span-5">
                <div className="rounded-2xl border border-surface-border bg-white/5 p-6">
                  <h2 className="text-lg font-heading font-bold text-white">Donate</h2>
                  <p className="text-sm text-gray-400 mt-2">
                    You can donate independently (not tied to gameplay).
                  </p>
                  <div className="mt-5 space-y-3">
                    <input
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="Amount (e.g. 25)"
                      className="w-full bg-[#0f172a] border border-surface-border rounded-lg px-4 py-3 text-white outline-none"
                      inputMode="decimal"
                    />
                    <button
                      type="button"
                      onClick={startDonation}
                      disabled={donating}
                      className="w-full rounded-lg bg-electric text-deep-900 font-semibold py-3 hover:opacity-90 disabled:opacity-60"
                    >
                      {donating ? 'Processing…' : 'Donate Now'}
                    </button>
                    <p className="text-xs text-gray-500">
                      Your donation is processed securely.
                    </p>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

