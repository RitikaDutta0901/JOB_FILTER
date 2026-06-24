import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService, roundService } from '../services/api';
import api from '../services/api'; // for direct notes custom endpoint mapping
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import RoundTimeline from '../components/RoundTimeline';
import {
  ArrowLeft, Edit3, Trash2, Calendar, MapPin, DollarSign, Globe, FileText,
  Plus, X, Check, Clock, AlertCircle, Building2
} from 'lucide-react';
import { formatDateLong } from '../utils/date';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Data State
  const [application, setApplication] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Note state
  const [noteContent, setNoteContent] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  
  // Add/Edit Round State
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [roundModalMode, setRoundModalMode] = useState('add'); // 'add' or 'edit'
  const [editingRoundId, setEditingRoundId] = useState(null);
  const [roundName, setRoundName] = useState('');
  const [roundType, setRoundType] = useState('OA');
  const [roundStatus, setRoundStatus] = useState('Pending');
  const [roundScheduledAt, setRoundScheduledAt] = useState('');
  const [roundNotes, setRoundNotes] = useState('');
  const [roundSubmitting, setRoundSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [id, isAuthenticated, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Application details, rounds, and notes in parallel
      const [appRes, roundsRes, notesRes] = await Promise.all([
        applicationService.getById(id),
        roundService.getByApplication(id),
        api.get(`/applications/${id}/notes`)
      ]);

      setApplication(appRes.data.application);
      setRounds(roundsRes.data.rounds);
      setNotes(notesRes.data.notes);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch details. The tracking ID might be invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (window.confirm('Are you sure you want to delete this application? All rounds and notes will be permanently removed.')) {
      try {
        await applicationService.delete(id);
        navigate('/');
      } catch (err) {
        console.error(err);
        alert('Failed to delete application.');
      }
    }
  };

  // Notes Actions
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setNoteSubmitting(true);
    try {
      const response = await api.post(`/applications/${id}/notes`, { content: noteContent.trim() });
      setNotes([response.data.note, ...notes]);
      setNoteContent('');
    } catch (err) {
      console.error(err);
      alert('Failed to save note.');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        setNotes(notes.filter(n => n.id !== noteId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete note.');
      }
    }
  };

  // Rounds Actions
  const handleOpenAddRound = () => {
    setRoundModalMode('add');
    setRoundName('');
    setRoundType('OA');
    setRoundStatus('Pending');
    setRoundScheduledAt('');
    setRoundNotes('');
    setShowRoundModal(true);
  };

  const handleOpenEditRound = (round) => {
    setRoundModalMode('edit');
    setEditingRoundId(round.id);
    setRoundName(round.round_name);
    setRoundType(round.round_type);
    setRoundStatus(round.status);
    
    if (round.scheduled_at) {
      const schDate = new Date(round.scheduled_at);
      const offset = schDate.getTimezoneOffset();
      const localSchDate = new Date(schDate.getTime() - offset * 60 * 1000);
      setRoundScheduledAt(localSchDate.toISOString().slice(0, 16));
    } else {
      setRoundScheduledAt('');
    }
    
    setRoundNotes(round.notes || '');
    setShowRoundModal(true);
  };

  const handleRoundSubmit = async (e) => {
    e.preventDefault();
    if (!roundName.trim()) return;

    setRoundSubmitting(true);
    try {
      const payload = {
        roundName,
        roundType,
        status: roundStatus,
        scheduledAt: roundScheduledAt ? new Date(roundScheduledAt).toISOString() : null,
        notes: roundNotes,
      };

      if (roundModalMode === 'add') {
        const res = await roundService.create(id, payload);
        // Refresh rounds
        setRounds([...rounds, res.data.round].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)));
      } else {
        const res = await roundService.update(editingRoundId, payload);
        setRounds(rounds.map(r => r.id === editingRoundId ? res.data.round : r).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)));
      }
      setShowRoundModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save interview round.');
    } finally {
      setRoundSubmitting(false);
    }
  };

  const handleDeleteRound = async (roundId) => {
    if (window.confirm('Delete this interview round?')) {
      try {
        await roundService.delete(roundId);
        setRounds(rounds.filter(r => r.id !== roundId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete round.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching details..." />;
  }

  if (error || !application) {
    return (
      <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/20 text-red-400">
        <AlertCircle className="mx-auto w-12 h-12 mb-4 opacity-80" />
        <h3 className="text-lg font-bold">Details Error</h3>
        <p className="text-sm mt-1">{error || 'Job not found'}</p>
        <Link to="/" className="text-brand-primary hover:underline text-sm font-semibold mt-4 inline-block">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-border/60 transition-all border border-transparent hover:border-brand-border"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{application.job_title}</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm text-brand-secondary font-medium mt-0.5">{application.company_name}</p>
          </div>
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/edit/${id}`}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-border hover:bg-brand-border/80 border border-brand-border/60 hover:border-brand-border text-gray-300 hover:text-white text-sm font-semibold transition-all"
          >
            <Edit3 size={15} />
            Edit
          </Link>
          <button
            onClick={handleDeleteApplication}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent text-sm font-semibold transition-all"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Info & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
            <h3 className="font-bold text-white text-lg tracking-tight border-b border-brand-border/60 pb-3 flex items-center gap-2">
              <Building2 size={18} className="text-brand-primary" />
              Application Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Globe className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  {application.company_website ? (
                    <a
                      href={application.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-secondary hover:underline font-medium"
                    >
                      {application.company_website.replace('https://', '').replace('http://', '')}
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Salary Package</p>
                  <span className="text-gray-200 font-medium">
                    {application.salary ? `$${parseFloat(application.salary).toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Location / Mode</p>
                  <span className="text-gray-200 font-medium">
                    {application.location || 'Remote'} ({application.work_mode})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Applied Date</p>
                  <span className="text-gray-200 font-medium">
                    {formatDateLong(application.applied_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <span className="text-gray-200 font-medium">
                    {application.deadline ? formatDateLong(application.deadline) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="text-gray-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Resume Link</p>
                  {application.resume_url ? (
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline font-medium"
                    >
                      Open Attached Resume
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium">No Resume Attached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description detail */}
            {application.job_description && (
              <div className="border-t border-brand-border/60 pt-5 space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/40">
                  {application.job_description}
                </p>
              </div>
            )}
          </div>

          {/* Notes Section Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60">
            <h3 className="font-bold text-white text-lg tracking-tight">Notes System</h3>
            
            {/* Quick add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add private remarks about this interview or recruiter..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-border/60 text-gray-200 text-sm focus:border-brand-primary outline-none transition-colors"
                required
              />
              <button
                type="submit"
                disabled={noteSubmitting}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                Add
              </button>
            </form>

            {/* List notes */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {notes.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No notes added yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-brand-dark/30 border border-brand-border/50 rounded-2xl p-4 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{note.content}</p>
                      <span className="text-[10px] text-gray-500 block">
                        {new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-brand-border/40 transition-colors shrink-0"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interview Timeline Stepper */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-brand-border/60 h-full">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h3 className="font-bold text-white text-lg tracking-tight">Interview Stepper</h3>
              <button
                onClick={handleOpenAddRound}
                className="p-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 hover:border-transparent transition-all flex items-center justify-center"
                title="Add Interview Stage"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Stepper Timeline */}
            <RoundTimeline
              rounds={rounds}
              onEditRound={handleOpenEditRound}
              onDeleteRound={handleDeleteRound}
            />
          </div>
        </div>
      </div>

      {/* Round Modal Overlay */}
      {showRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-3xl border border-brand-border w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRoundModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-brand-border/50"
            >
              <X size={16} />
            </button>

            <h3 className="font-bold text-white text-lg tracking-tight mb-4">
              {roundModalMode === 'add' ? 'Add Interview Round' : 'Edit Interview Round'}
            </h3>

            <form onSubmit={handleRoundSubmit} className="space-y-4">
              {/* Round Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Round Name *</label>
                <input
                  type="text"
                  placeholder="Resume Screen, OA, Technical 1, HR..."
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none"
                  required
                />
              </div>

              {/* Round Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Round Type</label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none"
                >
                  <option value="OA">Online Assessment (OA)</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Managerial">Managerial</option>
                  <option value="HR">HR Round</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Scheduled Date/Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={roundScheduledAt}
                  onChange={(e) => setRoundScheduledAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  value={roundStatus}
                  onChange={(e) => setRoundStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Round Notes</label>
                <textarea
                  placeholder="Specific focus, guidelines, topics covered, or expectations..."
                  value={roundNotes}
                  onChange={(e) => setRoundNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-24 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary text-gray-200 text-sm outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoundModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-border hover:bg-brand-border/80 text-gray-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roundSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold disabled:opacity-50"
                >
                  {roundSubmitting ? 'Saving...' : 'Save Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;
