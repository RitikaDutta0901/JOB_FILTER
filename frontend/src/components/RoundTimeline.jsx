import React from 'react';
import { Calendar, Tag, FileText, CheckCircle2, Clock, XCircle, Edit, Trash2 } from 'lucide-react';

const RoundTimeline = ({ rounds, onEditRound, onDeleteRound }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center p-6 bg-brand-card/40 rounded-2xl border border-brand-border/40">
        <p className="text-gray-400 text-sm">No interview rounds scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
      {rounds.map((round, idx) => (
        <div key={round.id} className="relative group animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
          {/* Marker Dot / Icon */}
          <span className="absolute -left-[27px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark border-2 border-brand-border group-hover:border-brand-primary transition-colors z-10">
            {getStatusIcon(round.status)}
          </span>

          {/* Timeline Card */}
          <div className="glass-panel rounded-2xl p-5 border border-brand-border/40 hover:border-brand-primary/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-bold text-white text-base tracking-tight">
                  {round.round_name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Tag size={12} className="text-gray-500" />
                    {round.round_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-500" />
                    {formatDate(round.scheduled_at)}
                  </span>
                </div>
              </div>

              {/* Badges / Small Actions */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border
                  ${round.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                  ${round.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                  ${round.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                `}>
                  {round.status}
                </span>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onEditRound && (
                    <button
                      onClick={() => onEditRound(round)}
                      className="p-1 rounded text-gray-400 hover:text-brand-primary hover:bg-brand-border transition-colors"
                      title="Edit Round"
                    >
                      <Edit size={13} />
                    </button>
                  )}
                  {onDeleteRound && (
                    <button
                      onClick={() => onDeleteRound(round.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-brand-border transition-colors"
                      title="Delete Round"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {round.notes && (
              <div className="mt-3 flex items-start gap-2 text-sm text-gray-300 bg-brand-border/20 rounded-xl p-3 border border-brand-border/30">
                <FileText size={14} className="text-brand-secondary shrink-0 mt-0.5" />
                <p className="leading-relaxed whitespace-pre-line">{round.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoundTimeline;
