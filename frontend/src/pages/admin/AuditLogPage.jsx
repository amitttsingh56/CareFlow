import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Clock, ArrowRight } from 'lucide-react';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-health-600" />
            <h1 className="text-2xl font-bold text-navy-800">Operational Audit Trail</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Immutable log of all capacity updates, verification decisions, plan upgrades, and configuration changes.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Ops Hub
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading audit log records...</div>
      ) : (
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Audit Details</th>
                  <th className="p-4">Diff (Before &rarr; After)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString()}{' '}
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-navy-50 text-navy-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{log.entityType}</td>
                    <td className="p-4 font-semibold text-navy-800">{log.performedByName}</td>
                    <td className="p-4 text-gray-600 max-w-xs">{log.details}</td>
                    <td className="p-4 text-[11px] font-mono text-gray-500 max-w-sm break-all">
                      {log.beforeValues && (
                        <div className="text-red-700 line-through">
                          {log.beforeValues}
                        </div>
                      )}
                      {log.afterValues && (
                        <div className="text-emerald-700 font-bold">
                          {log.afterValues}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
