import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Briefcase } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  // Pre-fill credentials helper for ease of evaluation
  const handlePrefill = () => {
    setEmail('john@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent text-white shadow-xl shadow-indigo-500/20 mb-3">
            <Briefcase size={24} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Sign in to <span className="text-brand-primary">JobStack</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">Track and analyze your job pipeline</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel rounded-3xl p-8 border border-brand-border/60 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] text-brand-secondary hover:text-brand-primary transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              <LogIn size={16} />
            </button>
          </form>

          {/* Quick Evaluate Helper Box */}
          <div className="mt-6 border-t border-brand-border/60 pt-5 text-center">
            <button
              onClick={handlePrefill}
              className="text-xs text-brand-secondary hover:underline font-semibold bg-brand-secondary/10 px-3.5 py-1.5 rounded-xl border border-brand-secondary/20 transition-all"
            >
              ⚡ Quick Fill Test Credentials (john_doe)
            </button>
          </div>
        </div>

        {/* Bottom Switch Link */}
        <p className="text-center mt-6 text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
