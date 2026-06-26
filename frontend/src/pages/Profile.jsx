import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Lock, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUsername(res.data.user.username);
      setEmail(res.data.user.email);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', { username, email });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (profileLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/20 text-red-400">
        <AlertCircle className="mx-auto w-12 h-12 mb-4 opacity-80" />
        <h3 className="text-lg font-bold">Error</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-border/60 transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <User className="text-brand-primary" />
            Profile Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account details and security</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
        <h3 className="font-bold text-white text-lg tracking-tight border-b border-brand-border/60 pb-3 flex items-center gap-2">
          <User size={18} className="text-brand-primary" />
          Account Information
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User size={15} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
                required
                minLength={3}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail size={15} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
        <h3 className="font-bold text-white text-lg tracking-tight border-b border-brand-border/60 pb-3 flex items-center gap-2">
          <Lock size={18} className="text-brand-primary" />
          Change Password
        </h3>
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Lock size={15} />
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
