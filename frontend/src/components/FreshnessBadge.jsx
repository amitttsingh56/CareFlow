import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FreshnessBadge = ({ freshness, className = '' }) => {
  if (!freshness) return null;

  const { level, isOutdated, minsAgo } = freshness;

  let timeText = 'Just now';
  if (minsAgo > 0) {
    if (minsAgo < 60) {
      timeText = `${minsAgo}m ago`;
    } else {
      const hrs = Math.floor(minsAgo / 60);
      const remainingMins = minsAgo % 60;
      timeText = remainingMins > 0 ? `${hrs}h ${remainingMins}m ago` : `${hrs}h ago`;
    }
  }

  if (level === 'Live') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        title="Reported within the last 15 minutes"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Live &bull; {timeText}</span>
      </span>
    );
  }

  if (level === 'Recent') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        title="Reported within the last 60 minutes"
      >
        <Clock className="w-3.5 h-3.5 text-blue-500" />
        <span>Recent &bull; {timeText}</span>
      </span>
    );
  }

  if (level === 'Aging') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Reported within 1 to 4 hours"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Aging &bull; {timeText}</span>
      </span>
    );
  }

  // Outdated (> 4h)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-300 ${className}`}
      title="Reported over 4 hours ago. Availability and wait times may have changed significantly."
    >
      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
      <span>⚠ Data may be outdated &bull; {timeText}</span>
    </span>
  );
};

export default FreshnessBadge;
