import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { getWinners, updateWinnerStatus } from '../../api/api';
import { TableRowSkeleton } from '../../components/admin/AdminUi';
import { toast } from 'react-toastify';

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b' },
  paid: { label: 'Paid', color: '#3b82f6' },
  rejected: { label: 'Rejected', color: '#ef4444' },
};

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchWinners();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWinners = () =>
    getWinners()
      .then(r => setWinners(r.data.winners || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  const handleStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await updateWinnerStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchWinners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 700 }}>Winners</h1>
        <p style={{ fontSize: 12, color: '#888' }}>
          Verify winner submissions and manage payouts
        </p>
      </motion.div>

      {/* SUMMARY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit,minmax(160px,1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        {[
          { label: 'Total', value: winners.length, color: '#3b82f6' },
          { label: 'Pending', value: winners.filter(w => w.status === 'pending').length, color: '#f59e0b' },
          { label: 'Rejected', value: winners.filter(w => w.status === 'rejected').length, color: '#ef4444' },
          { label: 'Paid', value: winners.filter(w => w.status === 'paid').length, color: '#8b5cf6' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: 14,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      {isMobile ? (
        /* 📱 MOBILE CARDS */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 100, background: '#111', borderRadius: 12 }} />
            ))
          ) : winners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Trophy size={32} style={{ opacity: 0.2 }} />
              <p>No winners yet</p>
            </div>
          ) : winners.map(w => {
            const s = statusConfig[w.status] || statusConfig.pending;

            return (
              <div key={w._id} style={{
                padding: 14,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontWeight: 600 }}>
                  {w.user?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {w.user?.email}
                </div>

                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Draw: {w.draw?.month || '—'}
                </div>

                <div style={{ fontSize: 12 }}>
                  Match: {w.matchType || '—'}
                </div>

                <div style={{ marginTop: 6, fontWeight: 700, color: '#34d399' }}>
                  ₹{(w.prizeAmount || 0).toFixed(2)}
                </div>

                <div style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: s.color,
                  fontWeight: 600
                }}>
                  {s.label}
                </div>

                {w.proofImage && (
                  <a href={w.proofImage} target="_blank" rel="noreferrer"
                     style={{ fontSize: 12, color: '#60a5fa' }}>
                    View Proof →
                  </a>
                )}

                {w.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => handleStatus(w._id, 'paid')}
                      disabled={!w.proofImage || updating === w._id + 'paid'}
                      style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        background: !w.proofImage ? '#334155' : '#10b981',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Verify & Pay
                    </button>
                    <button
                      onClick={() => handleStatus(w._id, 'rejected')}
                      disabled={updating === w._id + 'rejected'}
                      style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 8,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      ) : (
        /* 💻 DESKTOP TABLE */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderSpacing: '0 10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 12, color: '#888' }}>
                <th>Winner</th><th>Draw</th><th>Match</th><th>Amount</th><th>Status</th><th>Proof</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : winners.map(w => {
                  const s = statusConfig[w.status] || statusConfig.pending;
                  return (
                    <tr key={w._id} style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{w.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{w.user?.email}</div>
                      </td>
                      <td>{w.draw?.month || '—'}</td>
                      <td>{w.matchType || '—'}</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>
                        ₹{(w.prizeAmount || 0).toFixed(2)}
                      </td>
                      <td style={{ color: s.color }}>{s.label}</td>
                      <td>
                        {w.proofImage ? (
                          <a href={w.proofImage} target="_blank" rel="noreferrer noopener">View</a>
                        ) : '—'}
                      </td>
                      <td>
                        {w.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={!w.proofImage} onClick={() => handleStatus(w._id, 'paid')}>
                              Verify & Pay
                            </button>
                            <button onClick={() => handleStatus(w._id, 'rejected')}>Reject</button>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}