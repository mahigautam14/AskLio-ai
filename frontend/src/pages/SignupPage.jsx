import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { HiArrowRight, HiSparkles, HiShieldCheck, HiCode } from 'react-icons/hi';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setAuth(response.data.user, response.data.access_token);
      toast.success('Account created successfully!');
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Left side */}
        <div className="hidden lg:flex flex-col justify-center px-8 xl:px-12">
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-600 flex items-center justify-center font-bold shadow-lg shadow-teal-600/30">
              A
            </div>
            <div>
              <div className="text-xl font-semibold leading-none">AskLio</div>
              <div className="text-xs text-teal-500 mt-1">AI Chat Assistant</div>
            </div>
          </Link>

          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-200">
              <HiSparkles className="w-4 h-4" />
              Create your account in under a minute
            </div>

            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Start chatting with AskLio.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-teal-300">
              Save conversations, stream responses, and keep your work organized with a clean interface.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <HiShieldCheck className="w-5 h-5 text-teal-300" />
                <h3 className="mt-3 font-semibold">Secure signup</h3>
                <p className="mt-2 text-sm leading-6 text-teal-300">
                  JWT auth with SQLite storage for users and chats.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <HiCode className="w-5 h-5 text-teal-300" />
                <h3 className="mt-3 font-semibold">Developer-friendly</h3>
                <p className="mt-2 text-sm leading-6 text-teal-300">
                  Built to look professional in interviews and demos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-6 text-teal-900 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white text-xl font-bold shadow-lg shadow-teal-600/20">
                A
              </div>
              <h1 className="text-2xl font-bold">Create account</h1>
              <p className="mt-2 text-sm text-teal-500">
                Join AskLio and start chatting
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-teal-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-teal-300 bg-white px-4 py-3 text-teal-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="johndoe"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-teal-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-teal-300 bg-white px-4 py-3 text-teal-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-teal-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-teal-300 bg-white px-4 py-3 text-teal-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-teal-500">At least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
                {!loading && <HiArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-teal-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}