import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Layers,
  Lock,
  Calendar,
  AlertCircle,
  Download,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const HospitalAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading analytics...</div>;
  }

  const isStarter = data?.hospital?.plan === 'Starter';

  const dayOfWeekDemand = [
    { day: 'Mon', patients: 145, avgWait: 38 },
    { day: 'Tue', patients: 160, avgWait: 42 },
    { day: 'Wed', patients: 130, avgWait: 32 },
    { day: 'Thu', patients: 155, avgWait: 40 },
    { day: 'Fri', patients: 170, avgWait: 48 },
    { day: 'Sat', patients: 195, avgWait: 55 },
    { day: 'Sun', patients: 110, avgWait: 25 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-800">Operational Demand Analytics</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Illustrative demo data
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Historical demand patterns, department load distributions, and triage bottleneck alerts.
          </p>
        </div>

        <button
          onClick={() => alert('Analytics export simulated as CSV/PDF.')}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-navy-800 hover:bg-gray-50 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics</span>
        </button>
      </div>

      {isStarter ? (
        <div className="bg-white p-12 rounded-card border border-gray-200 text-center max-w-lg mx-auto space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-800">
            Advanced Analytics Requires Professional Plan
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Gain deep insights into peak influx hours, department wait distributions, and bed occupancy forecasts.
          </p>
          <Link
            to="/hospital/subscription"
            className="inline-block px-6 py-2.5 bg-health-600 text-white rounded-xl text-xs font-bold hover:bg-health-700 shadow-sm"
          >
            Upgrade to Professional (₹25,000 / month hypothesis)
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart 1: Hourly Demand Flow */}
          <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-800">
                  Hourly Queue Flow & Influx Patterns
                </h3>
                <p className="text-xs text-gray-400">
                  Peak triage hours occur between 10:00 AM and 1:00 PM (Illustrative demo data)
                </p>
              </div>
              <Clock className="w-4 h-4 text-health-600" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.hourlyWaitTimes} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2F4F', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="patients" name="Patients Registered" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="waitMinutes" name="Average Wait (mins)" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Day of Week Intake */}
          <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-800">
                  Weekly Patient Volume by Day
                </h3>
                <p className="text-xs text-gray-400">
                  Highest intake recorded on Saturdays (Illustrative demo data)
                </p>
              </div>
              <Calendar className="w-4 h-4 text-health-600" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekDemand} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2F4F', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="patients" name="Weekly Patients" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgWait" name="Average Wait (mins)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAnalyticsPage;
