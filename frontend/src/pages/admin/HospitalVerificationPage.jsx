import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Phone,
  FileCheck2,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const HospitalVerificationPage = () => {
  const { updateCounter } = useSocket();
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchPending = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/verifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.pendingHospitals) setPendingHospitals(data.pendingHospitals);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, [updateCounter]);

  const handleDecision = async (id, action) => {
    const reason = window.prompt(
      `Enter operational note for ${action === 'approve' ? 'approval' : 'rejection'}:`,
      action === 'approve' ? 'Facility documents verified and license active' : 'Information requires further verification'
    );
    if (reason === null) return;

    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch(`/api/admin/verifications/${id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        fetchPending();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold text-navy-800">Hospital Verification Queue</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review submitted medical licenses and operational registrations before publishing them to patients.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Ops Hub
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading pending queue...</div>
      ) : pendingHospitals.length === 0 ? (
        <div className="bg-white p-12 rounded-card text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-navy-800">Verification Queue Clear</h3>
          <p className="text-xs text-gray-500">
            No hospital registration requests are currently pending administrative review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="bg-white rounded-card p-6 border border-amber-200 shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Pending Operational Verification
                    </span>
                    <span className="text-xs text-gray-400">
                      Submitted: {new Date(hosp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-800">{hosp.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{hosp.address}, {hosp.city}, {hosp.state} - {hosp.pincode}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleDecision(hosp.id, 'reject')}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleDecision(hosp.id, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Registration No.</span>
                  <strong className="text-navy-800 font-mono">{hosp.regNumber}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Contact Phone</span>
                  <strong className="text-navy-800">{hosp.phone}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Selected Subscription</span>
                  <strong className="text-health-600">{hosp.plan} Plan</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Registered Contact Person</span>
                  <strong className="text-navy-800">{hosp.lastUpdatedBy}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalVerificationPage;
