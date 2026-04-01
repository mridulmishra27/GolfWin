import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="page-bg dashboard-root">
      <Sidebar />
      {/* Spacer for fixed mobile top bar */}
      <div className="mobile-topbar-spacer" />
      <main className="dashboard-main dashboard-content">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
