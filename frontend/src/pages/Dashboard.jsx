import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { applicationService, exportService } from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, RefreshCw, XCircle, Target, Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [roadmapStats, setRoadmapStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      setApplications([]);
      return;
    }
    setPage(1);
  }, [status, workMode, sortBy, sortOrder, isAuthenticated, authLoading]);

  const searchDebounceRef = useRef(null);
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!search.trim()) {
      fetchApplications();
      return;
    }
    if (search.trim().length < 2) return;
    searchDebounceRef.current = setTimeout(() => {
      fetchApplications();
    }, 600);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchApplications();
  }, [page, isAuthenticated, authLoading]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sortBy, sortOrder, page };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (workMode) params.workMode = workMode;

      const [applicationsRes, statsRes] = await Promise.all([
        applicationService.getAll(params),
        applicationService.getStats(),
      ]);
      setApplications(applicationsRes.data.applications);
      setTotalPages(applicationsRes.data.totalPages || 1);
      setTotalCount(applicationsRes.data.totalCount || 0);
      setRoadmapStats(statsRes.data.stats.roadmapProgress);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch applications. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setWorkMode('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (workMode) params.workMode = workMode;
      const response = await exportService.downloadCSV(params);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
      a.download = `applications_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const getStatsSummary = () => {
    const interviews = applications.filter(a => a.status === 'Interview' || a.status === 'OA').length;
    const offers = applications.filter(a => a.status === 'Offer').length;
    const pending = applications.filter(a => a.status === 'Applied' || a.status === 'Shortlisted').length;
    return { total: totalCount, interviews, offers, pending };
  };

  const metrics = getStatsSummary();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Job Applications
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track your placement process</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-border/40 hover:bg-brand-border/60 text-gray-300 hover:text-white text-sm font-semibold transition-all border border-brand-border/60"
            title="Export applications as CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <Link
            to="/add"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            New Application
          </Link>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Pipeline', value: metrics.total, color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5' },
          { label: 'OAs & Interviews', value: metrics.interviews, color: 'text-pink-400 border-pink-500/25 bg-pink-500/5' },
          { label: 'Offers Received', value: metrics.offers, color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' },
          { label: 'Pending Review', value: metrics.pending, color: 'text-amber-400 border-amber-500/25 bg-amber-500/5' },
        ].map((item, idx) => (
          <div key={idx} className={`border rounded-2xl p-4 flex flex-col justify-between ${item.color}`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{item.label}</span>
            <span className="text-2xl font-black mt-2">{item.value}</span>
          </div>
        ))}
      </div>

      {roadmapStats && (
        <div className="glass-panel rounded-2xl p-5 border border-brand-border/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-brand-secondary flex items-center justify-center shrink-0">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interview Readiness</h2>
              <p className="text-sm text-gray-400">
                {roadmapStats.completedTopics}/{roadmapStats.totalTopics} roadmap topics completed
              </p>
            </div>
          </div>
          <div className="w-full lg:max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400 font-medium">Overall preparation</span>
              <span className="text-brand-secondary font-black">{roadmapStats.completionPercentage}%</span>
            </div>
            <div className="h-2.5 bg-brand-dark rounded-full overflow-hidden border border-brand-border/60">
              <div
                className="h-full bg-brand-secondary transition-all duration-300"
                style={{ width: `${roadmapStats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-brand-border/40">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search bar */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Job title or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-300 text-sm focus:border-brand-primary outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              {['Applied', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Work Mode filter */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-300 text-sm focus:border-brand-primary outline-none transition-colors"
            >
              <option value="">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-300 text-sm focus:border-brand-primary outline-none transition-colors"
            >
              <option value="created_at-desc">Newest Added</option>
              <option value="created_at-asc">Oldest Added</option>
              <option value="applied_date-desc">Applied Date (New-Old)</option>
              <option value="applied_date-asc">Applied Date (Old-New)</option>
              <option value="salary-desc">Highest Salary</option>
              <option value="salary-asc">Lowest Salary</option>
              <option value="deadline-asc">Upcoming Deadline</option>
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-brand-border hover:bg-brand-border/80 text-white font-medium text-sm flex items-center justify-center gap-1.5 border border-transparent active:border-brand-primary/20 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-brand-border/40 hover:bg-brand-border/60 text-gray-400 hover:text-white transition-colors"
              title="Reset Filters"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Grid listing content */}
      {loading ? (
        <LoadingSpinner message="Fetching your tracking board..." />
      ) : error ? (
        <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/20 text-red-400">
          <XCircle className="mx-auto w-12 h-12 mb-4 opacity-80" />
          <h3 className="text-lg font-bold">Error loading applications</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center p-16 glass-panel rounded-3xl border border-brand-border/40 space-y-4">
          <div className="w-14 h-14 bg-brand-border/40 text-brand-primary border border-brand-border rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No applications found</h3>
            <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto">
              Get started by adding your first job tracker or clear your active search filters to view board list.
            </p>
          </div>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all shadow-md shadow-indigo-500/10"
          >
            Add Job Application
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div key={app.id} className="animate-slide-up">
                <ApplicationCard application={app} />
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-400 hover:text-white hover:border-brand-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                      p === page
                        ? 'bg-brand-primary text-white'
                        : 'bg-brand-dark border border-brand-border/60 text-gray-400 hover:text-white hover:border-brand-primary/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-400 hover:text-white hover:border-brand-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
