import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ImpactStats from './components/ImpactStats';
import CharityShowcase from './components/CharityShowcase';
import PricingPlans from './components/PricingPlans';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

// Auth Imports
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Public charity directory
import CharitiesList from './pages/charities/CharitiesList';
import CharityProfile from './pages/charities/CharityProfile';

// User Dashboard Imports
import DashboardOverview from './pages/dashboard/DashboardOverview';
import DashboardScores from './pages/dashboard/DashboardScores';
import DashboardCharity from './pages/dashboard/DashboardCharity';
import DashboardWinnings from './pages/dashboard/DashboardWinnings';
import SubscriptionReturn from './pages/subscription/SubscriptionReturn';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraw from './pages/admin/AdminDraw';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function PublicShell({ children }) {
  return (
    <div className="bg-deep-900 min-h-screen font-body text-gray-100 selection:bg-electric/30">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Homepage() {
  return (
    <PublicShell>
      <Hero />
      <HowItWorks />
      <ImpactStats />
      <CharityShowcase />
      <PricingPlans />
      <CTA />
    </PublicShell>
  );
}

// Protected Route wrapper
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-deep-900 flex items-center justify-center text-electric animate-pulse">Loading Platform...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// Admin Route wrapper
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-deep-900 flex items-center justify-center text-red-500 animate-pulse">Loading Admin Portal...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireSubscriber({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-deep-900 flex items-center justify-center text-electric animate-pulse">Loading subscription...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.subscriptionStatus !== 'active') return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-deep-900 text-gray-100 font-body">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-gradient-to-br from-deep-900 via-deep-900/95 to-deep-800 pt-20 md:pt-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastContainer theme="dark" position="bottom-right" />
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<Homepage />} />
        <Route path="/charities" element={<PublicShell><CharitiesList /></PublicShell>} />
        <Route path="/charities/:id" element={<PublicShell><CharityProfile /></PublicShell>} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardShell>
                <DashboardOverview />
              </DashboardShell>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/scores"
          element={
            <RequireAuth>
              <RequireSubscriber>
                <DashboardShell>
                  <DashboardScores />
                </DashboardShell>
              </RequireSubscriber>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/charity"
          element={
            <RequireAuth>
              <RequireSubscriber>
                <DashboardShell>
                  <DashboardCharity />
                </DashboardShell>
              </RequireSubscriber>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/winnings"
          element={
            <RequireAuth>
              <RequireSubscriber>
                <DashboardShell>
                  <DashboardWinnings />
                </DashboardShell>
              </RequireSubscriber>
            </RequireAuth>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/draw"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminDraw />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/charities"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminCharities />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/winners"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminWinners />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </RequireAdmin>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/subscription/return"
          element={
            <RequireAuth>
              <SubscriptionReturn />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}