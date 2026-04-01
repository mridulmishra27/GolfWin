import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, BarChart2, TrendingUp, Dice5, ChevronRight } from 'lucide-react';
import { getAnalytics, getLatestDraw } from '../../api/api';
import { GlowButton } from '../../components/admin/AdminUi';

import { useNavigate } from 'react-router-dom';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      getAnalytics().then(r => setAnalytics(r.data.metrics || r.data)),
      getLatestDraw().then(r => setDraw(r.data.draw || r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { icon: Users, label: 'Total Users', value: analytics.totalUsers || 0, color: '#3b82f6', glow: 'rgba(59,130,246,0.15)', sub: `Platform accounts` },
    { icon: TrendingUp, label: 'Current Prize Pool', value: `₹${(analytics.totalPrizePool || 0).toFixed(2)}`, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)', sub: 'Accumulated pot' },
    { icon: Heart, label: 'Charity Raised', value: `₹${(analytics.totalCharityFunds || 0).toFixed(2)}`, color: '#10b981', glow: 'rgba(16,185,129,0.15)', sub: 'Total worldwide impact' },
    { icon: Trophy, label: 'Pending Winners', value: analytics.pendingWinners || 0, color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)', sub: 'Awaiting your verification', badgeColor: (analytics.pendingWinners > 0) ? '#f43f5e' : null },
  ] : [];

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-6">

    {/* HEADER */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">
          Monitor platform metrics and system activity
        </p>
      </div>
  
      <GlowButton
        onClick={() => navigate('/admin/draw')}
        className="px-5 py-2.5 rounded-xl"
      >
        <Dice5 size={16} className="mr-2" />
        Run Draw
      </GlowButton>
    </motion.div>
  
    {/* STATS GRID */}
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
          ))
        : stats.map(({ icon: Icon, label, value, color, sub, badgeColor }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="relative p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              {/* top */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${color}15`,
                    color: color,
                  }}
                >
                  <Icon size={20} />
                </div>
  
                {badgeColor && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: badgeColor }}
                  />
                )}
              </div>
  
              {/* content */}
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
                <p className="text-[11px] text-gray-500 mt-2">{sub}</p>
              </div>
            </motion.div>
          ))}
    </motion.div>
  
    {/* MAIN GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  
      {/* DRAW PANEL */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="lg:col-span-2 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6"
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Live Draw</h3>
            <p className="text-xs text-gray-400">
              Latest generated lottery sequence
            </p>
          </div>
  
          <span
            className={`text-xs px-3 py-1 rounded-full border ${
              draw?.status === 'published'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}
          >
            {draw?.status === 'published' ? 'Published' : 'Pending'}
          </span>
        </div>
  
        {/* content */}
        {loading ? (
          <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
        ) : draw ? (
          <div className="flex flex-wrap items-center gap-6">
  
            {/* numbers */}
            <div>
              <p className="text-xs text-gray-500 mb-2">
                Numbers ({draw.month})
              </p>
              <div className="flex gap-2">
                {(draw.numbers || []).map((n, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-400/20 font-semibold"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
  
            {/* divider */}
            <div className="hidden sm:block h-10 w-px bg-white/10" />
  
            {/* pool */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Prize Pool</p>
              <p className="text-xl font-semibold text-blue-400">
                ₹{(draw.totalPool || 0).toFixed(2)}
              </p>
            </div>
  
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
            <p className="text-gray-500 text-sm">
              No draw executed yet
            </p>
          </div>
        )}
      </motion.div>
  
      {/* ACTION PANEL */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
  
        <div className="flex flex-col gap-2">
          {[
            { label: 'Manage Users', path: '/admin/users', icon: Users },
            { label: 'Verify Charities', path: '/admin/charities', icon: Heart },
            { label: 'Process Winners', path: '/admin/winners', icon: Trophy },
            { label: 'View Analytics', path: '/admin/analytics', icon: BarChart2 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="text-gray-300" />
                <span className="text-sm">{item.label}</span>
              </div>
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          ))}
        </div>
      </motion.div>
  
    </div>
  </div>
  );
}
