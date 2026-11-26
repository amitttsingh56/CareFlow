import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Send,
  Building2,
  Calendar,
} from 'lucide-react';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';

export const DataQualityMonitorPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const fetchQualityData = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/data-quality', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQualityData();
  }, []);

  const handleSendReminder = async (hospitalId) => {
    setRemindingId(hospitalId);
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch(`/api/admin/data-quality/${hospitalId}/remind`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setNotificationMsg(resData.message);
        fetchQualityData();
        setTimeout(() => setNotificationMsg(''), 4500);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setRemindingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading data quality monitor...</div>;
  }

  const { hospitals = [], staleCount, recentReminders = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-navy-800">Data Freshness & Quality Monitor</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            CareFlow enforces operational freshness standards. Hospitals with no update in over 4 hours are flagged as Outdated.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Ops Hub
        </Link>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Freshness Rule Alert Banner */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-navy-800">Freshness SLA Policy:</strong> Live updates (under 15 min), Recent (under 60 min), Aging (under 4 hours), and Outdated (over 4 hours). Outdated records automatically display a warning badge on patient cards to prevent reliance on stale bed data.
        </div>
      </div>

      {/* Staleness Table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-800">
            Hospitals Ranked by Staleness ({staleCount} currently stale)
          </h3>
          <span className="text-xs text-gray-500">Sorted oldest update first</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 text-gray-400 font-semibold text-[11px]">
              <tr>
                <th className="p-4">Hospital Facility</th>
                <th className="p-4">Freshness State</th>
                <th className="p-4">Reported Desk Source</th>
                <th className="p-4">Last Updated Time</th>
                <th className="p-4 text-right">Staleness Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hospitals.map((hosp) => (
                <tr
                  key={hosp.id}
                  className={`hover:bg-gray-50/50 ${
                    hosp.isStale ? 'bg-red-50/20' : ''
                  }`}
                >
                  <td className="p-4">
                    <span className="font-bold text-navy-800 block text-xs">{hosp.name}</span>
                    <span className="text-[11px] text-gray-500">{hosp.phone}</span>
                  </td>
                  <td className="p-4">
                    <FreshnessBadge freshness={hosp.freshness} />
                  </td>
                  <td className="p-4 text-gray-600">
                    <div>{hosp.dataSource}</div>
                    <span className="text-[10px] text-gray-400">By: {hosp.lastUpdatedBy}</span>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-[11px]">
                    {new Date(hosp.lastUpdated).toLocaleDateString()} {new Date(hosp.lastUpdated).toLocaleTimeString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleSendReminder(hosp.id)}
                      disabled={remindingId === hosp.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors ${
                        hosp.isStale
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{remindingId === hosp.id ? 'Sending...' : 'Send Reminder'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatched Reminders History */}
      <div className="bg-white rounded-card p-6 border border-gray-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-navy-800">Recent Automated Reminder Dispatches</h3>
        {recentReminders.length === 0 ? (
          <p className="text-xs text-gray-400">No recent reminders recorded.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentReminders.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-navy-800">{log.hospitalName}</span>
                  <span className="text-gray-400 text-[11px] ml-2">Sent by: {log.sentBy}</span>
                </div>
                <span className="text-gray-500 font-mono text-[11px]">
                  {new Date(log.sentAt).toLocaleTimeString()} &bull; Dispatched
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataQualityMonitorPage;
