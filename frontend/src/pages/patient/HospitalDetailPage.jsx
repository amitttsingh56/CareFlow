import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  Clock,
  Bed,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  Calendar,
  Building2,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
} from 'lucide-react';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';
import { SafetyNotice } from '../../components/SafetyNotice';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const { joinHospital, leaveHospital, updateCounter } = useSocket();
  const { user } = useAuth();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchHospital = useCallback(async () => {
    try {
      const res = await fetch(`/api/hospitals/${id}`);
      if (!res.ok) throw new Error('Hospital not found');
      const data = await res.json();
      setHospital(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHospital();
    joinHospital(id);

    return () => {
      leaveHospital(id);
    };
  }, [id, fetchHospital, joinHospital, leaveHospital, updateCounter]);

  // Check saved status
  useEffect(() => {
    if (user && id) {
      const token = localStorage.getItem('careflow_token');
      fetch('/api/patient/saved', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.savedHospitals) {
            setIsSaved(data.savedHospitals.some((h) => h.id === id));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user, id]);

  const handleToggleSave = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const token = localStorage.getItem('careflow_token');
      const res = await fetch(`/api/patient/saved/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-white rounded-card border border-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-card border border-gray-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-800">Hospital record not found</h2>
        <p className="text-xs text-gray-500">
          The requested hospital may be undergoing administrative verification or suspended.
        </p>
        <Link
          to="/search"
          className="inline-block px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const {
    name,
    regNumber,
    address,
    city,
    state,
    pincode,
    phone,
    website,
    latitude,
    longitude,
    emergencyStatus,
    generalBedsAvailable,
    generalBedsTotal,
    icuBedsAvailable,
    icuBedsTotal,
    emergencyBedsAvailable,
    emergencyBedsTotal,
    lastUpdated,
    lastUpdatedBy,
    dataSource,
    freshness,
    departments = [],
    diagnostics = [],
    doctors = [],
  } = hospital;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/search"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 flex items-center gap-1"
        >
          &larr; Back to Hospital Search
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-health-50 border-health-200 text-health-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-health-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hospital Hero Card */}
      <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Healthcare Facility &bull; Reg: {regNumber}
              </span>
              <FreshnessBadge freshness={freshness} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  {address}, {city}, {state} - {pincode}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-health-600">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-health-600 underline"
                >
                  Official Portal
                </a>
              </div>
            </div>
          </div>

          {/* Directions & Emergency Action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 rounded-xl bg-health-600 hover:bg-health-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-0.5">
              <div className="font-semibold text-navy-800">Reported Source:</div>
              <div>{dataSource} ({lastUpdatedBy})</div>
              <div>{new Date(lastUpdated).toLocaleTimeString()} ({freshness?.badge})</div>
            </div>
          </div>
        </div>

        {/* Emergency Status Banner */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 text-health-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Emergency Triage Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusChip status={emergencyStatus} type="emergency" />
                <span className="text-xs text-gray-500">
                  {emergencyStatus === 'Normal' && 'Accepting emergency cases without triage backlog.'}
                  {emergencyStatus === 'Busy' && 'Higher than average intake. Triage waiting in effect.'}
                  {emergencyStatus === 'Limited' && 'Critical capacity alert. Seek alternate facility if non-critical.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <SafetyNotice />

      {/* Bed Availability Section */}
      <section className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-health-600" />
            <h2 className="text-lg font-bold text-navy-800">Reported Bed Availability</h2>
          </div>
          <span className="text-xs text-gray-400">Subject to change</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* General Beds */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">General Ward Beds</span>
              <span className="text-[11px] text-gray-400">Total: {generalBedsTotal}</span>
            </div>
            <div className="text-2xl font-bold text-navy-800">
              {generalBedsAvailable}{' '}
              <span className="text-xs font-normal text-emerald-700 font-semibold">Available</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${generalBedsTotal > 0 ? (generalBedsAvailable / generalBedsTotal) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* ICU Beds */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">ICU Beds</span>
              <span className="text-[11px] text-gray-400">Total: {icuBedsTotal}</span>
            </div>
            <div className="text-2xl font-bold text-navy-800">
              {icuBedsAvailable}{' '}
              <span className="text-xs font-normal text-health-700 font-semibold">Available</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-health-600 h-full rounded-full"
                style={{
                  width: `${icuBedsTotal > 0 ? (icuBedsAvailable / icuBedsTotal) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Emergency Beds */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Emergency / Trauma Beds</span>
              <span className="text-[11px] text-gray-400">Total: {emergencyBedsTotal}</span>
            </div>
            <div className="text-2xl font-bold text-navy-800">
              {emergencyBedsAvailable}{' '}
              <span className="text-xs font-normal text-amber-700 font-semibold">Available</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${emergencyBedsTotal > 0 ? (emergencyBedsAvailable / emergencyBedsTotal) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* OPD Department Queues */}
      <section className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-health-600" />
            <h2 className="text-lg font-bold text-navy-800">OPD Queues & Estimated Wait Times</h2>
          </div>
          <span className="text-xs text-gray-400">Per department</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-health-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-navy-800">{dept.departmentName}</h4>
                <span className="text-xs font-semibold text-health-600 bg-health-50 px-2 py-0.5 rounded-full">
                  ~{dept.estimatedWaitMins} min wait
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Patients in queue:</span>
                <strong className="text-navy-800 font-bold">{dept.waitingCount} waiting</strong>
              </div>
              <div className="text-[11px] text-gray-400 pt-1 border-t border-gray-100 flex items-center justify-between">
                <span>Reported queue time</span>
                <span>{new Date(dept.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Availability Section */}
      <section className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-navy-800">Specialist Doctor Availability</h2>
          </div>
          <span className="text-xs text-gray-400">Live roster</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-gray-200 bg-white space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-navy-800">{doc.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{doc.specialty}</p>
                </div>
                <StatusChip status={doc.status} type="doctor" />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Room: {doc.roomNumber || 'OPD'}</span>
                <span className="font-semibold text-navy-800">
                  {doc.status === 'On duty' ? doc.nextAvailable || 'Immediate' : 'Roster off'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnostic Labs Waiting Times */}
      <section className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-health-600" />
            <h2 className="text-lg font-bold text-navy-800">Diagnostic Waiting Times</h2>
          </div>
          <span className="text-xs text-gray-400">Lab queue estimates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {diagnostics.map((diag) => (
            <div
              key={diag.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center space-y-1"
            >
              <span className="text-xs font-bold text-navy-800 block">{diag.testName}</span>
              <p className="text-xl font-extrabold text-health-600">
                ~{diag.estimatedWaitMins} <span className="text-xs font-normal">min</span>
              </p>
              <span className="text-[11px] text-gray-500 block">
                {diag.waitingCount} in line
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Hospital Contact Info Box */}
      <div className="p-6 rounded-card bg-gray-100 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-navy-800">Need immediate contact with reception?</h4>
          <p className="text-xs text-gray-600">
            Helpline: {phone} &bull; Emergency Direct: 108 / 112
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${phone}`}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900"
          >
            Call Desk
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg border border-navy-800 text-navy-800 text-xs font-semibold hover:bg-white"
          >
            Open Map
          </a>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPage;
