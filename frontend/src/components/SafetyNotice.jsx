import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const SafetyNotice = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs ${className}`}>
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-amber-950">Safety notice:</strong> For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-card bg-amber-50/90 border border-amber-200 text-amber-900 ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-950">Emergency & Availability Disclaimer</h4>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.</strong>
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            All queue lengths and bed figures are <strong>reported availability</strong> and <strong>estimated waiting times</strong>, subject to change without notice. CareFlow is an operational transparency platform to compare and choose — not a medical diagnostic or triage service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyNotice;
