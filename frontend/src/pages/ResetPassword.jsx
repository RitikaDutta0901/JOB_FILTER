import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center glass-panel rounded-3xl p-8 border border-red-500/20 space-y-4">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Invalid Reset Link</h2>
          <p className="text-sm text-gray-400">This reset link is invalid or missing a token.</p>
          <Link to="/forgot-password" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center glass-panel rounded-3xl p-8 border border-brand-border/60 space-y-4 animate-slide-up">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Password Reset Successful</h2>
          <p className="text-sm text-gray-400">Your password has been updated. You can now log in with your new password.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white font-sans">Set New Password</h1>
          <p className="text-sm text-gray-400 mt-2">Enter your new password below</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-brand-border/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Lock size={15} /></span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-xs text-gray-400 hover:text-brand-primary transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
