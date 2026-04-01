import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy } from 'lucide-react';
import { getAnalytics, getDrawHistory } from '../../api/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getAnalytics().then(r => setAnalytics(r.data.metrics || r.data)),
      getDrawHistory().then(r => setHistory(r.data.draws || r.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const areaData = history?.length
    ? history.slice(0, 6).reverse().map(d => ({
        name: d.month.split(' ')[0] || 'Unknown',
        revenue: (d.totalPool || 0) * 2,
        expenses: d.totalPool || 0,
        subscribers: d.subscriberCount || 0
      }))
    : [{ name: 'Pending', revenue: 0, expenses: 0, subscribers: 0 }];

  const barData = history?.length
    ? history.slice(0, 7).reverse().map(d => ({
        draw: d.month.split(' ')[0],
        subscribers: d.subscriberCount || 0,
        jackpotCarry: d.jackpotCarryForward || 0
      }))
    : [{ draw: 'Pending', subscribers: 0, jackpotCarry: 0 }];

  const pool = analytics?.totalPrizePool || 0;
  const pieData = [
    { name: 'Jackpot Pool', value: Number((pool * 0.40).toFixed(2)) },
    { name: 'Tier 2', value: Number((pool * 0.35).toFixed(2)) },
    { name: 'Tier 3', value: Number((pool * 0.25).toFixed(2)) },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: 'rgba(10,10,25,0.9)',
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)'
      }}>
        <p style={{ color: '#aaa', fontSize: 12 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill, fontWeight: 600 }}>
            {p.name}: ₹{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Platform Analytics</h1>

        <div style={{
          display: 'flex',
          gap: 8,
          background: 'rgba(255,255,255,0.05)',
          padding: 6,
          borderRadius: 10
        }}>
          <button style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 8 }}>Dashboard</button>
          <button style={{ opacity: 0.6 }}>Users</button>
          <button style={{ opacity: 0.6 }}>Reports</button>
        </div>
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: 24,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: 24
        }}
      >

        {/* STATS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 20
        }}>
          {[
            {
              title: 'Gross Volume',
              value: (analytics?.totalRevenue || 0) * 1.5,
              color: '#10b981'
            },
            {
              title: 'Prize Pool',
              value: analytics?.totalPrizePool || 0,
              color: '#f59e0b'
            },
            {
              title: 'Charity',
              value: analytics?.totalCharityFunds || 0,
              color: '#3b82f6'
            }
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, color: '#888' }}>{item.title}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>
                ₹{item.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: item.color }}>▲ Growth</div>
            </div>
          ))}
        </div>

        {/* AREA CHART */}
        <div style={{ height: 320 }}>
          {loading ? (
            <div style={{ height: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} />
          ) : (
            <ResponsiveContainer>
              <AreaChart data={areaData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="revenue" stroke="#8b5cf6" fillOpacity={0.3} fill="#8b5cf6" />
                <Area dataKey="expenses" stroke="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))',
        gap: 20
      }}>

        {/* BAR */}
        <div style={{
          padding: 20,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>User Engagement</h3>
            <button style={{ fontSize: 12 }}>
              This Week <ChevronDown size={14}/>
            </button>
          </div>

          <ResponsiveContainer height={220}>
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="draw" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="subscribers" fill="#3b82f6" />
              <Bar dataKey="jackpotCarry" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KPI */}
        <div style={{
          padding: 20,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)'
        }}>
          <h3>Current KPI Focus</h3>

          {[{
            label: 'Users',
            value: analytics?.totalUsers || 0,
            max: 100,
            color: '#10b981'
          },{
            label: 'Draws',
            value: analytics?.drawCount || 0,
            max: 10,
            color: '#8b5cf6'
          }].map((item,i)=>(
            <div key={i} style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div style={{
                height: 8,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 6
              }}>
                <div style={{
                  width: `${Math.min((item.value/item.max)*100,100)}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: 6
                }} />
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}>
            <Trophy size={16}/>
            <div>
              <div style={{ fontSize: 12 }}>Pending</div>
              <div style={{ fontWeight: 600 }}>{analytics?.pendingWinners || 0}</div>
            </div>
          </div>
        </div>

        {/* PIE */}
        <div style={{
          padding: 20,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          textAlign: 'center'
        }}>
          <h3>Prize Split</h3>

          <ResponsiveContainer height={220}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}