import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiArrowRight, HiEye, HiEyeOff } from 'react-icons/hi';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || 'Login failed. Please try again.';
  if (Array.isArray(detail)) {
    return detail
      .map((i) => (typeof i === 'string' ? i : i?.msg || JSON.stringify(i)))
      .join(', ');
  }
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail);
  return 'Login failed';
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Use Zustand store (NOT useAuth)
  const login = useStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login({ identifier, password });
      const { access_token, user } = res.data;

      // This updates the store → App.jsx will allow /chat
      login(access_token, user);

      navigate('/chat', { replace: true });
    } catch (err) {
      console.error('Login error:', err?.response?.data || err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#1a0333] to-[#0a0118]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(217,70,239,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,70,239,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-fuchsia-600/20 blur-[120px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pink-500/15 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow:
              '0 0 60px rgba(217,70,239,0.15), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ rotate: 12 }}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-fuchsia-600/40"
              >
                A
              </motion.div>
            </Link>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue your conversations
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 text-center"
            >
              {String(error)}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none transition-all"
                placeholder="Enter username or email"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fuchsia-300 transition-colors"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 py-3.5 font-semibold shadow-lg shadow-fuchsia-600/30 hover:shadow-2xl hover:shadow-fuchsia-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent font-medium"
            >
              Create one free →
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-slate-600 flex items-center justify-center gap-1">
          <HiSparkles className="w-3 h-3" />
          Powered by AskLio AI
        </p>
      </motion.div>
    </div>
  );
}