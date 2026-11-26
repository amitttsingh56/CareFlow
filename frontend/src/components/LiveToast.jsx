import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Radio, X } from 'lucide-react';

export const LiveToast = () => {
  const { liveNotification, clearNotification } = useSocket();

  if (!liveNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
      <div className="bg-navy-900 text-white rounded-card shadow-xl p-4 border border-navy-700 flex items-center gap-3.5 max-w-md">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {liveNotification.title}
            </h5>
            <span className="text-[11px] text-gray-400">{liveNotification.timestamp}</span>
          </div>
          <p className="text-xs text-gray-200 mt-0.5 leading-snug truncate">
            {liveNotification.message}
          </p>
        </div>
        <button
          onClick={clearNotification}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveToast;
