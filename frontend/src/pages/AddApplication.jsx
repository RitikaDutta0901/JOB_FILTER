import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../services/api';
import { Briefcase, ArrowLeft, Save, Building2, MapPin, DollarSign, Calendar, Globe, FileText } from 'lucide-react';

const AddApplication = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('Remote');
  const [status, setStatus] = useState('Applied');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Company Name and Job Title are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName,
        jobTitle,
        location,
        workMode,
        status,
        salary: salary ? parseFloat(salary) : null,
        appliedDate,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        jobUrl,
        resumeUrl,
        jobDescription,
      };

      await applicationService.create(payload);
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create application. Check inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-border/60 transition-all border border-transparent hover:border-brand-border"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Add Job Application</h1>
          <p className="text-xs text-gray-400 mt-0.5">Insert details for a new application item</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          {error}
        </div>
      )}

      {/* Main Form Panel */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core fields card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} className="text-gray-500" />
                Company Name *
              </label>
              <input
                type="text"
                placeholder="Google, Stripe, etc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
                required
              />
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={13} className="text-gray-500" />
                Job Title *
              </label>
              <input
                type="text"
                placeholder="Software Engineer, Product Designer..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
                required
              />
            </div>

            {/* Job URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-gray-500" />
                Job Posting URL
              </label>
              <input
                type="url"
                placeholder="https://company.com/careers/jobs"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
              />
            </div>

            {/* Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={13} className="text-gray-500" />
                Base Salary (Annual USD)
              </label>
              <input
                type="number"
                placeholder="120000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
                min="0"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-500" />
                Office Location
              </label>
              <input
                type="text"
                placeholder="San Francisco, CA (or Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
              />
            </div>

            {/* Resume Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-gray-500" />
                Resume URL (Google Drive / Dropbox)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/..."
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Job Description TextArea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Job Description Details
            </label>
            <textarea
              placeholder="Paste responsibilities, text specs, or key stacks mentioned in the posting..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-3 h-40 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Status card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60 h-fit">
          <h3 className="font-bold text-white text-lg tracking-tight">Status & Dates</h3>

          {/* Pipeline Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pipeline Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none transition-colors"
            >
              {['Applied', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none transition-colors"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Applied Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-500" />
              Applied Date
            </label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
              required
            />
          </div>

          {/* Submission Deadline */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-500" />
              Application Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-100 text-sm outline-none transition-colors"
            />
          </div>

          {/* Save Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 mt-4"
          >
            {submitting ? 'Saving tracking item...' : 'Save Application'}
            <Save size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddApplication;
