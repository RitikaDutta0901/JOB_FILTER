import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Building2, ChevronRight, Edit3 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({ application, onDelete }) => {
  const {
    id,
    job_title,
    company_name,
    company_logo,
    location,
    work_mode,
    salary,
    applied_date,
    status,
  } = application;

  // Format currency
  const formatSalary = (val) => {
    if (!val) return 'N/A';
    const num = parseFloat(val);
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}k`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between h-full border border-brand-border/40 hover:border-brand-primary/20">
      <div>
        {/* Card Header: Company Logo, Status, Company Name */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {company_logo ? (
              <img
                src={company_logo}
                alt={company_name}
                className="w-11 h-11 rounded-xl bg-white/5 object-contain p-1 border border-brand-border/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-11 h-11 rounded-xl bg-brand-border/40 text-brand-primary border border-brand-border flex items-center justify-center font-bold text-lg"
              style={{ display: company_logo ? 'none' : 'flex' }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 text-base leading-tight truncate max-w-[140px]">
                {company_name}
              </h4>
              <p className="text-xs text-brand-secondary font-medium mt-0.5">{work_mode}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Job Title */}
        <h3 className="font-bold text-white text-lg tracking-tight mb-3 hover:text-brand-primary transition-colors truncate">
          <Link to={`/applications/${id}`}>{job_title}</Link>
        </h3>

        {/* Metadata Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={14} className="text-gray-500" />
            <span className="truncate">{location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={14} className="text-gray-500" />
            <span>Applied: {formatDate(applied_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <DollarSign size={14} className="text-gray-500" />
            <span>Salary: {formatSalary(salary)}</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-auto">
        <Link
          to={`/edit/${id}`}
          className="p-2 rounded-xl text-gray-400 hover:text-brand-primary hover:bg-brand-border/50 border border-transparent hover:border-brand-border transition-all duration-200"
          title="Edit Application"
        >
          <Edit3 size={15} />
        </Link>
        <Link
          to={`/applications/${id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/20 hover:border-transparent transition-all duration-200"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ApplicationCard;
