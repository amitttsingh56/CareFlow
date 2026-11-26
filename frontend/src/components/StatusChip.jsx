import React from 'react';

export const StatusChip = ({ status, type = 'emergency', className = '' }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;
  let dotColor = 'bg-gray-400';

  if (normalized === 'normal' || normalized === 'available' || normalized === 'verified' || normalized === 'on duty') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
    if (type === 'emergency') label = 'Normal Load';
  } else if (normalized === 'busy' || normalized === 'caution' || normalized === 'pending') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
    if (type === 'emergency') label = 'Busy';
  } else if (normalized === 'limited' || normalized === 'high load' || normalized === 'suspended' || normalized === 'off duty' || normalized === 'on leave') {
    styles = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-500';
    if (type === 'emergency') label = 'Limited Capacity';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
    </span>
  );
};

export default StatusChip;
