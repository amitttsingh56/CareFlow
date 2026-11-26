import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  LogIn,
  User,
  Building2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'hospital') navigate('/hospital/dashboard');
      else navigate('/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(roleKey);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'hospital') navigate('/hospital/dashboard');
      else navigate('/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-navy-800 text-health-500 flex items-center justify-center mx-auto shadow-sm">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800">Sign in to CareFlow</h1>
        <p className="text-xs text-gray-500">
          "Know before you go." Access capacity intelligence and hospital dashboards.
        </p>
      </div>

      {/* 1-Click Demo Login Panel (Crucial for investor demo) */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-card p-5 shadow-card space-y-3 border border-navy-700">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>1-Click Investor Demo Login</span>
        </div>
        <p className="text-[11px] text-gray-300">
          Choose a role below to sign in instantly with pre-seeded demo accounts:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Patient Demo */}
          <button
            type="button"
            onClick={() => handleDemo('patient')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-colors flex items-center gap-2 group"
          >
            <User className="w-4 h-4 text-health-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold block text-white group-hover:text-health-300 truncate">
                Patient Demo
              </span>
              <span className="text-[10px] text-gray-300 block truncate">Public User</span>
            </div>
          </button>

          {/* Hospital 1 Demo */}
          <button
            type="button"
            onClick={() => handleDemo('hospital1')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-colors flex items-center gap-2 group"
          >
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold block text-white group-hover:text-emerald-300 truncate">
                Hospital Staff 1
              </span>
              <span className="text-[10px] text-gray-300 block truncate">Heritage (Pro)</span>
            </div>
          </button>

          {/* Hospital 2 Demo */}
          <button
            type="button"
            onClick={() => handleDemo('hospital2')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-colors flex items-center gap-2 group"
          >
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold block text-white group-hover:text-amber-300 truncate">
                Hospital Staff 2
              </span>
              <span className="text-[10px] text-gray-300 block truncate">Apex Super Sp.</span>
            </div>
          </button>

          {/* Admin Demo */}
          <button
            type="button"
            onClick={() => handleDemo('admin')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-colors flex items-center gap-2 group"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold block text-white group-hover:text-purple-300 truncate">
                Admin Ops
              </span>
              <span className="text-[10px] text-gray-300 block truncate">CareFlow Ops</span>
            </div>
          </button>
        </div>
      </div>

      {/* Standard Email/Password Form */}
      <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@domain.com"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-health-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
