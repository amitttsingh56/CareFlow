import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Zap,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';
import { useSocket } from '../../context/SocketContext';

export const HospitalManagementPage = () => {
  const { updateCounter } = useSocket();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');

  const fetchHospitals = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/hospitals', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.hospitals) setHospitals(data.hospitals);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, [updateCounter]);

  const handleUpdate = async (id, payload) => {
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch(`/api/admin/hospitals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message);
        fetchHospitals();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (filter === 'all') return true;
    return h.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-health-600" />
            <h1 className="text-2xl font-bold text-navy-800">Hospital Facility Management</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Directory of all registered healthcare facilities across Varanasi and Bhadohi.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Ops Hub
        </Link>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'verified', 'pending', 'suspended'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-navy-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-4">Facility Name & Reg</th>
              <th className="p-4">Status</th>
              <th className="p-4">Subscription Plan</th>
              <th className="p-4">Freshness</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredHospitals.map((hosp) => (
              <tr key={hosp.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <span className="font-bold text-navy-800 block text-xs">{hosp.name}</span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {hosp.regNumber} &bull; {hosp.city}
                  </span>
                </td>
                <td className="p-4">
                  <StatusChip status={hosp.status} type="status" />
                </td>
                <td className="p-4">
                  <span className="font-semibold text-navy-800">{hosp.plan}</span>
                </td>
                <td className="p-4">
                  <FreshnessBadge freshness={hosp.freshness} />
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(hosp.lastUpdated).toLocaleTimeString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  {/* Plan Switch */}
                  <button
                    onClick={() =>
                      handleUpdate(hosp.id, {
                        plan: hosp.plan === 'Starter' ? 'Professional' : 'Starter',
                      })
                    }
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-semibold text-navy-800 hover:bg-gray-100"
                    title="Change subscription plan"
                  >
                    Switch to {hosp.plan === 'Starter' ? 'Professional' : 'Starter'}
                  </button>

                  {/* Suspend / Reactivate */}
                  {hosp.status === 'Verified' ? (
                    <button
                      onClick={() => handleUpdate(hosp.id, { status: 'Suspended' })}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold"
                    >
                      Suspend
                    </button>
                  ) : hosp.status === 'Suspended' ? (
                    <button
                      onClick={() => handleUpdate(hosp.id, { status: 'Verified' })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                    >
                      Reactivate
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalManagementPage;
