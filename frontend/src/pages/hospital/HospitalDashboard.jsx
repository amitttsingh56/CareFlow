import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Bed,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const { updateCounter } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, [updateCounter]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading operational dashboard...</div>;
  }

  if (!data?.hospital) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-card border border-gray-200 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-navy-800">No hospital profile assigned</h2>
        <p className="text-xs text-gray-500">
          Your account is not linked to an active hospital facility. Contact operations support.
        </p>
      </div>
    );
  }

  const {
    hospital,
    freshness,
    totalOPDWaiting,
    hourlyWaitTimes = [],
    departmentLoad = [],
    planFeatures,
  } = data;

  const isPendingVerification = hospital.status === 'Pending';
  const isSuspended = hospital.status === 'Suspended';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pending or Suspended Banner */}
      {isPendingVerification && (
        <div className="p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-950">Verification in Progress</h4>
            <p>
              Your facility registration ({hospital.regNumber}) is currently being reviewed by the CareFlow Operations Team. Once verified, your live capacity will be published to public patient searches.
            </p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="p-4 rounded-card bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-red-950">Facility Access Suspended</h4>
            <p>
              This facility is currently paused from the public directory. Please review with platform administration.
            </p>
          </div>
        </div>
      )}

      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
              {hospital.name}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800">
              Plan: {hospital.plan}
            </span>
            <FreshnessBadge freshness={freshness} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Operational Desk &bull; Logged in as {user.name} ({user.hospitalRole || 'Editor'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/hospital/status"
            className="px-4 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Update Operational Status</span>
          </Link>

          <Link
            to={`/hospitals/${hospital.id}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-navy-800 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Preview Public View</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Emergency Load */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Emergency Status</span>
            <Activity className="w-4 h-4 text-health-600" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <StatusChip status={hospital.emergencyStatus} type="emergency" />
            <Link
              to="/hospital/status"
              className="text-[11px] font-semibold text-health-600 hover:underline"
            >
              Change
            </Link>
          </div>
        </div>

        {/* Card 2: OPD Patients Waiting */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total OPD Waiting</span>
            <Clock className="w-4 h-4 text-health-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-navy-800">{totalOPDWaiting}</span>
            <span className="text-xs text-gray-400">across {hospital.departments?.length || 0} depts</span>
          </div>
        </div>

        {/* Card 3: Bed Availability */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Reported Beds</span>
            <Bed className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-emerald-700">
              {hospital.generalBedsAvailable + hospital.icuBedsAvailable + hospital.emergencyBedsAvailable}
            </span>
            <span className="text-xs text-gray-400">total available</span>
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between pt-0.5">
            <span>Gen: {hospital.generalBedsAvailable}</span>
            <span>ICU: {hospital.icuBedsAvailable}</span>
            <span>Emerg: {hospital.emergencyBedsAvailable}</span>
          </div>
        </div>

        {/* Card 4: Freshness & Source */}
        <div className="bg-white p-5 rounded-card border border-gray-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Last Operational Update</span>
            <ShieldCheck className="w-4 h-4 text-health-600" />
          </div>
          <div className="pt-1">
            <span className="text-sm font-bold text-navy-800 block">
              {new Date(hospital.lastUpdated).toLocaleTimeString()}
            </span>
            <span className="text-[11px] text-gray-400 truncate block">
              By: {hospital.lastUpdatedBy}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts (Illustrative demo data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: OPD Waiting Times over the Day */}
        <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-800">
                OPD Waiting Times Over the Day (Minutes)
              </h3>
              <p className="text-[11px] text-gray-400">
                Hourly wait pattern based on desk check-in pace (Illustrative demo data)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-health-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyWaitTimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A2F4F', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="waitMinutes"
                  name="Est. Wait (mins)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Department Load */}
        <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-800">
                Department Queue Load
              </h3>
              <p className="text-[11px] text-gray-400">
                Active waiting patients per department (Illustrative demo data)
              </p>
            </div>
            <Layers className="w-4 h-4 text-health-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentLoad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A2F4F', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="waiting" name="Patients Waiting" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Plan Limits Notice & Quick Links */}
      <div className="p-5 rounded-card bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-navy-800">Hospital Subscription Tier</h4>
          <p className="text-xs text-gray-500">
            {hospital.plan === 'Starter'
              ? 'Starter Tier: Includes manual OPD queue updates and doctor availability. Upgrade to Professional for bed counts, diagnostics, and analytics.'
              : 'Professional Tier: Full capacity management unlocked (Bed availability, Diagnostic queues, Demand analytics, Multi-staff).'}
          </p>
        </div>
        <Link
          to="/hospital/subscription"
          className="px-4 py-2 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900 shrink-0"
        >
          Manage Subscription
        </Link>
      </div>
    </div>
  );
};

export default HospitalDashboard;
