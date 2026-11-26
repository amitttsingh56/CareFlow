import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bed,
  Clock,
  FlaskConical,
  Save,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { StatusChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

export const StatusUpdatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [emergencyStatus, setEmergencyStatus] = useState('Normal');
  const [generalBedsAvailable, setGeneralBedsAvailable] = useState(0);
  const [icuBedsAvailable, setIcuBedsAvailable] = useState(0);
  const [emergencyBedsAvailable, setEmergencyBedsAvailable] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.hospital) {
          setHospital(data.hospital);
          setEmergencyStatus(data.hospital.emergencyStatus);
          setGeneralBedsAvailable(data.hospital.generalBedsAvailable);
          setIcuBedsAvailable(data.hospital.icuBedsAvailable);
          setEmergencyBedsAvailable(data.hospital.emergencyBedsAvailable);
          setDepartments(data.hospital.departments || []);
          setDiagnostics(data.hospital.diagnostics || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeptChange = (id, field, value) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleDiagChange = (id, field, value) => {
    setDiagnostics((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('careflow_token');
      const payload = {
        emergencyStatus,
        departments,
      };

      // Bed availability & Diagnostics only if Professional
      if (hospital.plan === 'Professional') {
        payload.generalBedsAvailable = generalBedsAvailable;
        payload.icuBedsAvailable = icuBedsAvailable;
        payload.emergencyBedsAvailable = emergencyBedsAvailable;
        payload.diagnostics = diagnostics;
      }

      const res = await fetch('/api/hospital/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setSuccessMsg(
        `Reported availability published live at ${new Date(data.lastUpdated).toLocaleTimeString()} by ${data.lastUpdatedBy}.`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading editor...</div>;
  }

  const isStarter = hospital?.plan === 'Starter';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">
            Publish Operational Status & Queues
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Updating these numbers broadcasts live availability to patients across the region immediately.
          </p>
        </div>

        <Link
          to="/hospital/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">Successfully Published!</h4>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: 1-Click Emergency Load */}
        <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-health-600" />
              <h2 className="text-base font-bold text-navy-800">Emergency Triage Load (1-Click)</h2>
            </div>
            <span className="text-xs text-gray-400">Current: {emergencyStatus}</span>
          </div>
          <p className="text-xs text-gray-500">
            Click one to immediately update your emergency intake status:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Normal */}
            <button
              type="button"
              onClick={() => setEmergencyStatus('Normal')}
              className={`p-4 rounded-xl border text-left transition-all ${
                emergencyStatus === 'Normal'
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Normal</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Normal patient intake. Triage moving rapidly with standard turnaround.
              </p>
            </button>

            {/* Busy */}
            <button
              type="button"
              onClick={() => setEmergencyStatus('Busy')}
              className={`p-4 rounded-xl border text-left transition-all ${
                emergencyStatus === 'Busy'
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">Busy</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Elevated emergency traffic. Triage wait times in effect for non-critical cases.
              </p>
            </button>

            {/* Limited */}
            <button
              type="button"
              onClick={() => setEmergencyStatus('Limited')}
              className={`p-4 rounded-xl border text-left transition-all ${
                emergencyStatus === 'Limited'
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800">Limited Capacity</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              </div>
              <p className="text-[11px] text-red-700 mt-1">
                Near or at capacity. Trauma diversion or extended queue warnings advised.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: OPD Department Queues */}
        <div className="bg-white p-6 rounded-card border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-health-600" />
              <h2 className="text-base font-bold text-navy-800">OPD Department Queue Metrics</h2>
            </div>
            <span className="text-xs text-gray-400">Available on Starter & Professional</span>
          </div>

          <div className="divide-y divide-gray-100">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="w-48 font-semibold text-xs text-navy-800">
                  {dept.departmentName}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-0.5">
                      Waiting Patients
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dept.waitingCount}
                      onChange={(e) =>
                        handleDeptChange(dept.id, 'waitingCount', parseInt(e.target.value) || 0)
                      }
                      className="w-28 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 block mb-0.5">
                      Est. Wait (Minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dept.estimatedWaitMins}
                      onChange={(e) =>
                        handleDeptChange(dept.id, 'estimatedWaitMins', parseInt(e.target.value) || 0)
                      }
                      className="w-28 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Bed Availability (Enforce Plan Gating) */}
        <div className={`p-6 rounded-card border shadow-card relative ${isStarter ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
          {isStarter && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-card z-10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-800">
                Bed Availability Management is a Professional Plan Feature
              </h3>
              <p className="text-xs text-gray-500 max-w-md">
                Hospitals on the Starter plan report OPD queues. Upgrade to Professional to publish real-time General, ICU, and Emergency bed counts.
              </p>
              <Link
                to="/hospital/subscription"
                className="px-4 py-2 rounded-xl bg-health-600 text-white text-xs font-semibold hover:bg-health-700 shadow-sm"
              >
                Upgrade to Professional (₹25,000/mo hypothesis)
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-navy-800">Reported Bed Availability</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Professional Plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                General Ward Beds Available
              </label>
              <input
                type="number"
                min="0"
                value={generalBedsAvailable}
                onChange={(e) => setGeneralBedsAvailable(parseInt(e.target.value) || 0)}
                disabled={isStarter}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-gray-400">Total capacity: {hospital.generalBedsTotal}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                ICU Beds Available
              </label>
              <input
                type="number"
                min="0"
                value={icuBedsAvailable}
                onChange={(e) => setIcuBedsAvailable(parseInt(e.target.value) || 0)}
                disabled={isStarter}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
              />
              <span className="text-[11px] text-gray-400">Total capacity: {hospital.icuBedsTotal}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Emergency Beds Available
              </label>
              <input
                type="number"
                min="0"
                value={emergencyBedsAvailable}
                onChange={(e) => setEmergencyBedsAvailable(parseInt(e.target.value) || 0)}
                disabled={isStarter}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[11px] text-gray-400">Total capacity: {hospital.emergencyBedsTotal}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Diagnostics Queue Times (Enforce Plan Gating) */}
        <div className={`p-6 rounded-card border shadow-card relative ${isStarter ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
          {isStarter && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-card z-10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-navy-800">
                Diagnostic Queue Publishing is a Professional Feature
              </h3>
              <p className="text-xs text-gray-500 max-w-md">
                Publish lab waiting times for MRI, CT scan, and Blood tests with the Professional plan.
              </p>
              <Link
                to="/hospital/subscription"
                className="px-4 py-2 rounded-xl bg-health-600 text-white text-xs font-semibold hover:bg-health-700 shadow-sm"
              >
                Upgrade to Professional
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-health-600" />
              <h2 className="text-base font-bold text-navy-800">Diagnostic Queue Times</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-health-50 text-health-700">
              Professional Plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {diagnostics.map((diag) => (
              <div key={diag.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-navy-800 block">{diag.testName}</span>
                <div>
                  <label className="text-[11px] text-gray-500 block">Est. Wait (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={diag.estimatedWaitMins}
                    onChange={(e) =>
                      handleDiagChange(diag.id, 'estimatedWaitMins', parseInt(e.target.value) || 0)
                    }
                    disabled={isStarter}
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block">In Line</label>
                  <input
                    type="number"
                    min="0"
                    value={diag.waitingCount}
                    onChange={(e) =>
                      handleDiagChange(diag.id, 'waitingCount', parseInt(e.target.value) || 0)
                    }
                    disabled={isStarter}
                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Reporting staff: <strong className="text-navy-800">{user.name}</strong> &bull; Changes broadcast live instantly
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Updates...' : 'Publish Live Availability'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdatePage;
