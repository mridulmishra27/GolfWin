import { ArrowRight, CalendarDays, Trophy, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getProfile, getWinners } from '../../api/api';

export default function DashboardOverview() {
  const { user } = useAuth();

  const subscriptionStatus = user?.subscriptionStatus || 'inactive';
  const renewalDate = user?.renewalDate || null;
  const isActive = subscriptionStatus === 'active';
  const isLapsed = subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled';

  const [participation, setParticipation] = useState({
    drawsEntered: 0,
    upcomingDrawMonth: null,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        const dash = res?.data?.dashboard;
        if (!mounted || !dash) return;
        setParticipation({
          drawsEntered: dash?.participation?.drawsEntered ?? 0,
          upcomingDrawMonth: dash?.participation?.upcomingDrawMonth ?? null,
        });
      } catch {
        // keep defaults
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [winnings, setWinnings] = useState({
    totalWon: 0,
    pendingPayouts: 0,
    lastWinDate: null,
  });

  useEffect(() => {
    let mounted = true;

    const subscriptionActive = user?.subscriptionStatus === 'active';
    if (!subscriptionActive) {
      setWinnings({ totalWon: 0, pendingPayouts: 0, lastWinDate: null });
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        const res = await getWinners();
        const list = res?.data?.winners || [];
        if (!mounted) return;

        const totalWon = list.reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);
        const pendingPayouts = list
          .filter((w) => w.status === 'pending')
          .reduce((sum, w) => sum + Number(w.prizeAmount || 0), 0);

        const lastWin = list
          .map((w) => w.createdAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0];

        setWinnings({
          totalWon,
          pendingPayouts,
          lastWinDate: lastWin || null,
        });
      } catch {
        // keep current winnings state
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.subscriptionStatus]);

  const selectedCharity = user?.charity || null;
  const contributionPercentage = user?.charityPercentage ?? user?.charity_percentage ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-center gap-2 mb-1 sm:mb-2">
            Hey {user?.name || 'golfer'} <Sparkles className="text-electric" size={20} />
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Track your subscription, scores, charity impact and winnings.
          </p>
        </div>
        <Link
          to="/dashboard/scores"
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-colors"
        >
          Add scores
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </section>

      {/* Top row: subscription + charity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Subscription status */}
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold mb-1">
                Subscription
              </p>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Status & renewal
              </h2>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] w-fit ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {isActive ? 'Active' : isLapsed ? 'Lapsed' : 'No subscription'}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-300 flex-grow flex flex-col">
            {isActive && renewalDate ? (
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-3 bg-[#0f172a] rounded-lg p-3 sm:p-4 border border-surface-border">
                  <CalendarDays size={20} className="text-electric shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Next renewal on</p>
                    <p className="font-semibold text-white">
                      {new Date(renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-auto">
                  You will be automatically entered in all eligible draws until this date.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                <p className="text-sm text-gray-400">
                  {isLapsed
                    ? 'Your subscription has lapsed. Renew now to restore full dashboard access.'
                    : 'You don&apos;t have an active subscription yet. Subscribe to start entering weekly'}
                  {' '}
                  golf draws and supporting charities.
                </p>
                <Link
                  to="/#pricing"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-auto bg-electric/10 text-electric rounded-lg font-semibold hover:bg-electric/20 transition-colors w-fit"
                >
                  {isLapsed ? 'Renew subscription' : 'View subscription options'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Selected charity */}
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold mb-1">
                Charity
              </p>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Your impact
              </h2>
            </div>
            <Link
              to="/dashboard/charity"
              className="text-sm font-semibold text-electric hover:text-electric/80 transition-colors"
            >
              Manage
            </Link>
          </div>

          <div className="mt-2 text-sm text-gray-300 flex-grow flex flex-col">
            {selectedCharity ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0f172a] rounded-lg p-4 border border-surface-border">
                <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center text-electric text-sm font-bold shrink-0">
                  {contributionPercentage}%
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{selectedCharity.name}</p>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                    {selectedCharity.description || 'Your subscription contributes directly to this cause.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                You haven&apos;t picked a charity yet. Choose where your contribution goes and set your
                preferred percentage.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Participation + winnings */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Participation summary */}
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-lg font-heading font-bold text-white">
            Participation
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2">
            <div className="bg-[#0f172a] border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-electric mb-1">
                {participation.drawsEntered}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] text-gray-400 font-semibold">
                Draws entered
              </p>
            </div>
            <div className="bg-[#0f172a] border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
                {participation.upcomingDrawMonth ? participation.upcomingDrawMonth : '—'}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] text-gray-400 font-semibold">
                Upcoming draw
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-auto pt-2">
            Upcoming draw month updates when an admin creates/simulates the next draw.
          </p>
        </div>

        {/* Winnings overview */}
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              Winnings
              <Trophy size={18} className="text-amber-400" />
            </h2>
            <Link
              to="/dashboard/winnings"
              className="text-sm font-semibold text-electric hover:text-electric/80 transition-colors"
            >
              View details
            </Link>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between bg-[#0f172a] px-4 py-3.5 rounded-lg border border-surface-border">
              <span className="text-sm text-gray-400">Total won</span>
              <span className="text-lg font-heading font-bold text-white">
                ₹{winnings.totalWon.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-[#0f172a] px-4 py-3.5 rounded-lg border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full" />
              <span className="text-sm text-gray-400 relative z-10">Pending payouts</span>
              <span className="text-lg font-heading font-bold text-amber-400 relative z-10">
                ₹{winnings.pendingPayouts.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 px-2 mt-auto pt-3">
              <span>Last win</span>
              <span>{winnings.lastWinDate ? new Date(winnings.lastWinDate).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bento-card p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-lg font-heading font-bold text-white">
            Quick links
          </h2>
          <div className="flex flex-col gap-3 mt-2">
            <Link
              to="/dashboard/scores"
              className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-surface-border hover:border-electric/50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-200">Manage scores</span>
              <ArrowRight size={18} className="text-electric opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              to="/dashboard/charity"
              className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-surface-border hover:border-electric/50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-200">Change charity</span>
              <ArrowRight size={18} className="text-electric opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              to="/dashboard/winnings"
              className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-surface-border hover:border-amber-400/50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-200">Winnings history</span>
              <ArrowRight size={18} className="text-amber-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
