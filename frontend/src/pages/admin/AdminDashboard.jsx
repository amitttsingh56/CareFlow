import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRight,
  FileText,
  Activity,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { updateCounter } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const fetchStats = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [updateCounter]);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data to initial pristine state? This will restore all 10 hospitals and demo accounts.')) {
      return;
    }

    setResetting(true);
    setResetSuccess('');
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setResetSuccess(resData.message);
        fetchStats();
        setTimeout(() => setResetSuccess(''), 4000);
      }
    } catch (err) {
      alert('Failed to reset demo: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading operations dashboard...</div>;
  }

  const { stats, recentActivity = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-navy-800">CareFlow Operations Hub</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Platform governance, facility verifications, data freshness monitoring, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-navy-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Reset database back to realistic initial demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-health-600 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Demo...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetSuccess}</span>
        </div>
      )}

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Hospitals */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Registered Facilities</span>
          <p className="text-2xl font-bold text-navy-800">{stats.totalHospitals}</p>
          <span className="text-[10px] text-gray-400 block">{stats.verifiedHospitals} Active / Verified</span>
        </div>

        {/* Pending Verifications */}
        <Link
          to="/admin/verifications"
          className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle hover:border-amber-400 transition-colors space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 block">Pending Verification</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-bold text-amber-600 group-hover:text-amber-700">
            {stats.pendingVerifications}
          </p>
          <span className="text-[10px] text-amber-700 block font-medium">Review queue &rarr;</span>
        </Link>

        {/* Stale Data Hospitals */}
        <Link
          to="/admin/data-quality"
          className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle hover:border-red-400 transition-colors space-y-1 group"
        >
          <span className="text-[11px] font-semibold text-gray-500 block">Stale Data (&gt;4h)</span>
          <p className="text-2xl font-bold text-red-600 group-hover:text-red-700">
            {stats.staleHospitalsCount}
          </p>
          <span className="text-[10px] text-red-700 block font-medium">Quality Monitor &rarr;</span>
        </Link>

        {/* Active Patients */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Patient Users</span>
          <p className="text-2xl font-bold text-navy-800">{stats.totalPatients}</p>
          <span className="text-[10px] text-gray-400 block">Pilot region accounts</span>
        </div>

        {/* Suspended Facilities */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 block">Suspended Facilities</span>
          <p className="text-2xl font-bold text-gray-600">{stats.suspendedHospitals}</p>
          <span className="text-[10px] text-gray-400 block">Compliance paused</span>
        </div>
      </div>

      {/* Admin Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/verifications"
          className="p-5 bg-white rounded-card border border-gray-200 hover:shadow-card transition-shadow space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-800 group-hover:text-health-600 transition-colors">
            Hospital Verification Queue
          </h3>
          <p className="text-xs text-gray-500">
            Verify newly registered medical facilities and publish them to public search.
          </p>
        </Link>

        <Link
          to="/admin/hospitals"
          className="p-5 bg-white rounded-card border border-gray-200 hover:shadow-card transition-shadow space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-health-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-800 group-hover:text-health-600 transition-colors">
            Hospital Facility Directory
          </h3>
          <p className="text-xs text-gray-500">
            Manage plans, suspend non-compliant facilities, and reactivate verified centers.
          </p>
        </Link>

        <Link
          to="/admin/data-quality"
          className="p-5 bg-white rounded-card border border-gray-200 hover:shadow-card transition-shadow space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-800 group-hover:text-health-600 transition-colors">
            Data Quality & Staleness
          </h3>
          <p className="text-xs text-gray-500">
            Track hospitals with outdated data (&gt;4 hours) and dispatch operational reminders.
          </p>
        </Link>

        <Link
          to="/admin/content"
          className="p-5 bg-white rounded-card border border-gray-200 hover:shadow-card transition-shadow space-y-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-navy-800 group-hover:text-health-600 transition-colors">
            Platform Content & Notice
          </h3>
          <p className="text-xs text-gray-500">
            Edit landing page headline and mandatory emergency safety disclaimers.
          </p>
        </Link>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="bg-white rounded-card p-6 border border-gray-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-health-600" />
            <h2 className="text-base font-bold text-navy-800">Recent Operations Activity Feed</h2>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-health-600 hover:text-health-700 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivity.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-navy-800">{log.details}</span>
                <div className="text-gray-400 text-[11px]">
                  Actor: <strong className="text-gray-600">{log.performedByName}</strong> &bull; Entity: {log.entityType}
                </div>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
