import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUserApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerUserApi(name, email, password);
      
      if (res.session && res.session.access_token) {
        // Backend auto-logs them in returning session and user
        loginUser(res.session.access_token, res.user);
        navigate('/dashboard'); // Take them directly to dashboard to add scores/charity
      } else {
        // If email confirmation is required, session will be null
        navigate('/login', { 
          state: { message: 'Registration successful! Please check your email to verify your account.' } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-900 font-body flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orchid/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-electric/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
        
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric to-orchid flex items-center justify-center shadow-glow-cyan text-deep-900 font-bold">
              G
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              Golf<span className="text-electric">Win</span>
            </span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Join the Platform</h1>
          <p className="text-gray-400 text-sm">Create your account to start playing and giving.</p>
        </div>

        <div className="glass-card p-8 border border-surface-border relative">
           {error && (
             <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium text-center">
               {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                 <div className="relative">
                   <FiUser className="absolute left-4 top-3.5 text-gray-500" />
                   <input 
                     type="text" 
                     value={name}
                     onChange={(e)=>setName(e.target.value)}
                     className="w-full bg-deep-900 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orchid transition-colors"
                     required
                     placeholder="John Doe"
                   />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                 <div className="relative">
                   <FiMail className="absolute left-4 top-3.5 text-gray-500" />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e)=>setEmail(e.target.value)}
                     className="w-full bg-deep-900 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orchid transition-colors"
                     required
                     placeholder="you@example.com"
                   />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                 <div className="relative">
                   <FiLock className="absolute left-4 top-3.5 text-gray-500" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e)=>setPassword(e.target.value)}
                     className="w-full bg-deep-900 border border-surface-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orchid transition-colors"
                     required
                     minLength="8"
                     placeholder="At least 8 characters"
                   />
                 </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 mt-4 flex items-center justify-center gap-2 text-lg text-white font-bold bg-gradient-to-r from-orchid to-electric rounded-xl shadow-glow-orchid transition-transform active:scale-95">
                 {loading ? "Creating Account..." : <>Sign Up Now <FiArrowRight /></>}
              </button>
           </form>

           <div className="mt-8 text-center text-sm text-gray-400">
             Already have an account? <Link to="/login" className="text-orchid font-bold hover:underline">Log in</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
