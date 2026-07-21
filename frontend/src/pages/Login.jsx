import React, { useState } from 'react';
import { useAuth } from '../context/AuthStates';
import { Mail, Lock, Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Image used directly from public folder

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden font-sans">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12 relative bg-[#F8FAFF]">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold mb-4 tracking-wider uppercase">
              <Package size={10} />
              Inventory System
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
              Login <span className="text-orange-400">✌️</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome back! Please enter your details.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-600 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@renix.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-600 transition-all placeholder:text-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-600 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-600 transition-all placeholder:text-gray-300 shadow-sm"
                  required
                />
              </div>
              <div className="flex justify-end pt-1">
                <button type="button" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
                  Forgot?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Login Now'
              )}
            </button>
          </form>

          {/* Simple Codevern Branding */}
          <div className="mt-12 text-center">
             <p className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">
               Powered by <span className="text-green-600 font-black">Spren</span>
             </p>
          </div>
        </div>
      </div>

      {/* Right Column: Illustration (Hidden on mobile) */}
      <div className="hidden lg:block relative bg-[#16a34a] overflow-hidden">
        {/* Wavy Patterns matching Renix Blue */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 Q25,20 50,40 T100,40 V100 H0 Z" fill="white" />
            <path d="M0,70 Q30,50 60,70 T100,70 V100 H0 Z" fill="white" />
          </svg>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-12">
          {/* Main Visual Container */}
          <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-10 w-full max-w-[500px] border border-white/20 shadow-2xl relative flex flex-col items-center">
            
            <h2 className="text-3xl font-black text-white leading-tight mb-8 text-center">
              Scale your business with Renix <br /> 
              <span className="text-green-200">Inventory management.</span> 🚀
            </h2>

            <div className="relative w-full max-w-[380px]">
              <div className="bg-white/5 p-1.5 rounded-3xl">
                <img 
                  src="/login_illustration.png" 
                  alt="Renix Dashboard" 
                  className="w-full rounded-[1.5rem] object-cover shadow-2xl border border-white/10"
                />
              </div>
              
              {/* Simple Badges */}
              <div className="absolute -left-6 bottom-8 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-green-50">
                <span className="text-lg">🤝</span>
                <p className="text-[11px] font-black text-gray-900 tracking-tight">Growth Focused</p>
              </div>

              <div className="absolute -right-6 top-8 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 border border-green-50">
                <span className="text-lg">💯</span>
                <p className="text-[11px] font-black text-gray-900 tracking-tight">Verified Results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
