import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Heart, Trophy, Users,
  Dice5, BarChart2, LogOut, X, Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/scores', icon: Target, label: 'My Scores' },
  { to: '/dashboard/charity', icon: Heart, label: 'Charity' },
  { to: '/dashboard/winnings', icon: Trophy, label: 'Winnings' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draw', icon: Dice5, label: 'Draw Control' },
  { to: '/admin/charities', icon: Heart, label: 'Charities' },
  { to: '/admin/winners', icon: Trophy, label: 'Winners' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ inDrawer = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: inDrawer ? '24px 20px 16px' : '28px 24px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>⛳</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Golf<span className="gradient-text">Win</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </div>
          </div>
        </div>
        {inDrawer && (
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.subscriptionStatus === 'active'
                ? <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>● Active</span>
                : <span className="badge badge-inactive" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>● Inactive</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 8 }}>
          Navigation
        </div>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'none', border: 'none', color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile via CSS) ── */}
      <div className="sidebar desktop-sidebar">
        <SidebarContent />
      </div>

      {/* ── MOBILE TOP HEADER BAR ── */}
      <div className="mobile-topbar">
        <button
          className="mobile-topbar-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⛳</div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1rem', color: 'white' }}>
            Golf<span className="gradient-text">Win</span>
          </span>
        </div>

        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 59 }}
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 280, zIndex: 60,
                background: 'rgba(5,5,16,0.98)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid var(--glass-border)',
              }}
            >
              <SidebarContent inDrawer />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      {user?.role !== 'admin' && (
        <nav className="mobile-tabbar">
          {userLinks.map(({ to, icon: Icon, label, end }) => {
            const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="mobile-tab"
                style={{ color: isActive ? '#60a5fa' : 'var(--text-muted)' }}
              >
                <div className="mobile-tab-icon" style={{ background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent', borderRadius: 10 }}>
                  <Icon size={20} />
                </div>
                <span className="mobile-tab-label" style={{ color: isActive ? '#60a5fa' : 'var(--text-muted)' }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </>
  );
}
