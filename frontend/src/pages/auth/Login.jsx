import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUserApi } from '../../api/api';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUserApi(email, password);
      if (!res?.session?.access_token || !res?.user) {
        throw new Error('Invalid login response from server');
      }
      loginUser(res.session.access_token, res.user);
      
      // Route based on role
      if (res.user.role === 'admin') {
         navigate('/admin');
      } else {
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-900 font-body flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orchid/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric to-orchid flex items-center justify-center shadow-glow-cyan text-deep-900 font-bold">
              G
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              Golf<span className="text-electric">Win</span>
            </span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to manage your scores and winnings.</p>
        </div>

        <div className="glass-card p-8 border border-surface-border relative">
           {error && (
             <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium text-center">
               {error}
             </div>
           )}

           {successMessage && !error && (
             <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-xl mb-6 text-sm font-medium text-center">
               {successMessage}
             </div>
           )}

           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                 <div className="relative">
                   <FiMail className="absolute left-4 top-3.5 text-gray-500" />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e)=>setEmail(e.target.value)}
                     className="w-full bg-deep-900 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-electric transition-colors"
                     required
                     placeholder="you@example.com"
                   />
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-medium text-gray-400">Password</label>
                   <Link to="#" className="text-xs text-electric hover:underline">Forgot password?</Link>
                 </div>
                 <div className="relative">
  <FiLock className="absolute left-4 top-3.5 text-gray-500" />

  <input 
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e)=>setPassword(e.target.value)}
    className="w-full bg-deep-900 border border-surface-border rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:border-electric transition-colors"
    required
    placeholder="••••••••"
  />

  {/* 👁️ Eye Toggle Button */}
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition"
  >
    {showPassword ? <FiEyeOff /> : <FiEye />}
  </button>
</div>
              </div>

              <button disabled={loading} type="submit" className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2 text-lg shadow-glow-cyan">
                 {loading ? "Authenticating..." : <>Sign In <FiArrowRight /></>}
              </button>
           </form>

           <div className="mt-8 text-center text-sm text-gray-400">
             Don't have an account? <Link to="/signup" className="text-electric font-bold hover:underline">Create one</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
