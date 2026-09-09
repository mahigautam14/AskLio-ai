import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiArrowRight, HiEye, HiEyeOff, HiCheck } from 'react-icons/hi';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return 'Signup failed. Please try again.';
  if (Array.isArray(detail)) {
    return detail
      .map((i) => (typeof i === 'string' ? i : i?.msg || JSON.stringify(i)))
      .join(', ');
  }
  if (typeof detail === 'string') return detail;
  return 'Signup failed';
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const passwordChecks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.signup({ username, email, password });
      const { access_token, user } = res.data;
      login(access_token, user);
      navigate('/chat', { replace: true });
    } catch (err) {
      console.error('Signup error:', err?.response?.data || err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#1a0333] to-[#0a0118]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center font-bold text-xl">
                A
              </div>
            </Link>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">Join AskLio and start chatting</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 text-center">
              {String(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          c.valid
                            ? 'bg-fuchsia-500/20 text-fuchsia-400'
                            : 'bg-slate-700 text-slate-500'
                        }`}
                      >
                        {c.valid && <HiCheck className="w-3 h-3" />}
                      </div>
                      <span className={c.valid ? 'text-fuchsia-300' : 'text-slate-500'}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 py-3.5 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-fuchsia-400 font-medium">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}