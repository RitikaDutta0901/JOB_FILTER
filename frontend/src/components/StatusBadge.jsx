import React from 'react';

const StatusBadge = ({ status }) => {
  // Return HSL-specific style parameters for each application pipeline phase
  const statusStyles = {
    Applied: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      dot: 'bg-blue-400',
    },
    Shortlisted: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      dot: 'bg-indigo-400',
    },
    OA: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      dot: 'bg-amber-400',
    },
    Interview: {
      bg: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
      dot: 'bg-pink-400',
    },
    Offer: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]',
      dot: 'bg-emerald-400 animate-pulse',
    },
    Rejected: {
      bg: 'bg-red-500/10 border-red-500/20 text-red-400',
      dot: 'bg-red-400',
    },
    Withdrawn: {
      bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
      dot: 'bg-gray-400',
    },
  };

  const style = statusStyles[status] || {
    bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
