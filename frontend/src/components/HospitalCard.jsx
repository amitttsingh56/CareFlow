import React from 'react';
import { Link } from 'react-router-dom';
import { FreshnessBadge } from './FreshnessBadge';
import { StatusChip } from './StatusChip';
import {
  MapPin,
  Clock,
  Bed,
  Users,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export const HospitalCard = ({
  hospital,
  isSaved = false,
  onToggleSave,
  onToggleCompare,
  isCompared = false,
}) => {
  const {
    id,
    name,
    address,
    city,
    distanceKm,
    emergencyStatus,
    generalBedsAvailable,
    generalBedsTotal,
    icuBedsAvailable,
    icuBedsTotal,
    avgDeptWaitMins,
    matchedDeptWaitMins,
    freshness,
    dataSource,
    lastUpdatedBy,
    onDutyDoctorsCount,
    specialties = [],
  } = hospital;

  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3 h-3" />
                Verified Facility
              </span>
              <FreshnessBadge freshness={freshness} />
            </div>

            <h3 className="text-base font-bold text-navy-800 group-hover:text-health-600 transition-colors line-clamp-1">
              <Link to={`/hospitals/${id}`}>{name}</Link>
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate max-w-[260px]">{address}, {city}</span>
              {distanceKm !== null && distanceKm !== undefined && (
                <span className="font-semibold text-navy-800 ml-1">
                  &bull; {distanceKm} km away
                </span>
              )}
            </div>
          </div>

          {/* Action Bookmark */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(id)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-health-50 border-health-200 text-health-600'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-navy-800'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save hospital'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-health-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Emergency Status Chip */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Emergency Load:</span>
            <StatusChip status={emergencyStatus} type="emergency" />
          </div>
          {onToggleCompare && (
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onToggleCompare(hospital)}
                className="rounded border-gray-300 text-health-600 focus:ring-health-500"
              />
              <span className="font-medium">Compare</span>
            </label>
          )}
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="px-5 py-3 bg-gray-50/70 border-y border-gray-100 grid grid-cols-3 gap-2 text-center">
        {/* OPD Wait */}
        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 font-medium">
            <Clock className="w-3 h-3 text-health-600" />
            <span>Est. Wait</span>
          </div>
          <p className="text-sm font-bold text-navy-800 mt-0.5">
            ~{matchedDeptWaitMins || avgDeptWaitMins || 20} min
          </p>
          <span className="text-[10px] text-gray-400 leading-tight block">
            {matchedDeptWaitMins ? 'Selected dept' : 'Average OPD'}
          </span>
        </div>

        {/* General Beds */}
        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 font-medium">
            <Bed className="w-3 h-3 text-emerald-600" />
            <span>Gen Beds</span>
          </div>
          <p className="text-sm font-bold text-navy-800 mt-0.5">
            {generalBedsAvailable} <span className="text-[11px] font-normal text-gray-400">/ {generalBedsTotal}</span>
          </p>
          <span className="text-[10px] text-gray-400 leading-tight block">Reported avail.</span>
        </div>

        {/* ICU Beds */}
        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 font-medium">
            <Activity className="w-3 h-3 text-health-600" />
            <span>ICU Beds</span>
          </div>
          <p className="text-sm font-bold text-navy-800 mt-0.5">
            {icuBedsAvailable} <span className="text-[11px] font-normal text-gray-400">/ {icuBedsTotal}</span>
          </p>
          <span className="text-[10px] text-gray-400 leading-tight block">Reported avail.</span>
        </div>
      </div>

      {/* Specialties preview pills */}
      {specialties.length > 0 && (
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {specialties.slice(0, 4).map((spec) => (
            <span
              key={spec}
              className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
            >
              {spec}
            </span>
          ))}
          {specialties.length > 4 && (
            <span className="text-[11px] text-gray-400 font-medium px-1.5 py-0.5">
              +{specialties.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer Info & Action */}
      <div className="p-5 pt-3 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span>Source: {dataSource || 'Hospital dashboard'}</span>
          <span>Subject to change</span>
        </div>

        <Link
          to={`/hospitals/${id}`}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-navy-800 text-white hover:bg-navy-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>View Current Capacity & Queues</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default HospitalCard;
