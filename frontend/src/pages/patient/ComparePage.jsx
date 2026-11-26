import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Scale,
  Plus,
  X,
  Clock,
  Bed,
  Activity,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';
import { SafetyNotice } from '../../components/SafetyNotice';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialIds = (searchParams.get('ids') || '')
    .split(',')
    .filter(Boolean)
    .slice(0, 3);

  const [selectedIds, setSelectedIds] = useState(initialIds);

  // Fetch list of all verified hospitals for the dropdown selectors
  useEffect(() => {
    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((data) => {
        if (data.hospitals) {
          setAllHospitals(data.hospitals);
          // If no initial ids, pick first two
          if (initialIds.length === 0 && data.hospitals.length >= 2) {
            setSelectedIds([data.hospitals[0].id, data.hospitals[1].id]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch comparison details whenever selectedIds change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setHospitals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/hospitals/compare?ids=${selectedIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hospitals) {
          setHospitals(data.hospitals);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    setSearchParams({ ids: selectedIds.join(',') });
  }, [selectedIds]);

  const handleAddHospital = (id) => {
    if (selectedIds.length >= 3) {
      alert('You can compare a maximum of 3 hospitals side by side.');
      return;
    }
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveHospital = (id) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-health-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-800">
              Hospital Capacity Comparison
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Compare reported emergency loads, OPD queue times, and bed availability side by side to make an informed choice.
          </p>
        </div>

        {/* Add Hospital Selector */}
        {selectedIds.length < 3 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddHospital(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-200 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
            >
              <option value="" disabled>
                + Add Hospital to Compare ({selectedIds.length}/3)
              </option>
              {allHospitals
                .filter((h) => !selectedIds.includes(h.id))
                .map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <SafetyNotice compact={true} />

      {/* Comparison Matrix Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading comparison metrics...</div>
      ) : hospitals.length === 0 ? (
        <div className="bg-white p-12 rounded-card text-center border border-gray-200 space-y-3">
          <p className="text-sm font-semibold text-gray-600">No hospitals selected for comparison.</p>
          <Link
            to="/search"
            className="inline-block px-4 py-2 bg-health-600 text-white rounded-lg text-xs font-semibold"
          >
            Find Hospitals to Compare
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70">
                <th className="p-4 w-48 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  Operational Metric
                </th>
                {hospitals.map((hosp) => (
                  <th key={hosp.id} className="p-4 min-w-[240px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-navy-800 line-clamp-1">{hosp.name}</h3>
                        <p className="text-[11px] text-gray-500">{hosp.city}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveHospital(hosp.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Emergency Status */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Emergency Load</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <StatusChip status={hosp.emergencyStatus} type="emergency" />
                  </td>
                ))}
              </tr>

              {/* Data Freshness */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Report Freshness</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <FreshnessBadge freshness={hosp.freshness} />
                  </td>
                ))}
              </tr>

              {/* Average OPD Queue Wait */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Avg. OPD Queue Wait</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <span className="text-sm font-bold text-navy-800">
                      ~{hosp.avgWaitMins} mins
                    </span>
                    <span className="text-[10px] text-gray-400 block">Reported estimate</span>
                  </td>
                ))}
              </tr>

              {/* General Beds Available */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">General Beds</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <span className="font-bold text-emerald-700 text-sm">
                      {hosp.generalBedsAvailable}
                    </span>{' '}
                    <span className="text-gray-400">/ {hosp.generalBedsTotal} available</span>
                  </td>
                ))}
              </tr>

              {/* ICU Beds Available */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">ICU Beds</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <span className="font-bold text-health-600 text-sm">
                      {hosp.icuBedsAvailable}
                    </span>{' '}
                    <span className="text-gray-400">/ {hosp.icuBedsTotal} available</span>
                  </td>
                ))}
              </tr>

              {/* Emergency Beds */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Emergency Beds</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <span className="font-bold text-navy-800 text-sm">
                      {hosp.emergencyBedsAvailable}
                    </span>{' '}
                    <span className="text-gray-400">/ {hosp.emergencyBedsTotal} available</span>
                  </td>
                ))}
              </tr>

              {/* Specialist Doctors on Duty */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Doctors On Duty</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <span className="font-bold text-navy-800">
                      {hosp.onDutyDoctors} doctors
                    </span>{' '}
                    <span className="text-gray-400 text-[11px]">({hosp.totalDoctors} on roster)</span>
                  </td>
                ))}
              </tr>

              {/* Diagnostics Available */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Diagnostics Offered</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {hosp.diagnostics?.map((d) => (
                        <span
                          key={d.id}
                          className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]"
                        >
                          {d.testName} (~{d.estimatedWaitMins}m)
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Button */}
              <tr>
                <td className="p-4 font-semibold text-gray-600 bg-gray-50/40">Action</td>
                {hospitals.map((hosp) => (
                  <td key={hosp.id} className="p-4">
                    <Link
                      to={`/hospitals/${hosp.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      <span>View Queues</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
