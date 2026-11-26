import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Scale,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { HospitalCard } from '../../components/HospitalCard';
import { LeafletMap } from '../../components/LeafletMap';
import { SafetyNotice } from '../../components/SafetyNotice';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateCounter } = useSocket();
  const { user } = useAuth();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [savedIds, setSavedIds] = useState([]);
  const [comparedHospitals, setComparedHospitals] = useState([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'all');
  const [diagnosticTest, setDiagnosticTest] = useState(searchParams.get('test') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [freshness, setFreshness] = useState(searchParams.get('freshness') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'wait');

  // Fetch Hospitals
  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specialty && specialty !== 'all') params.append('specialty', specialty);
      if (diagnosticTest && diagnosticTest !== 'all') params.append('test', diagnosticTest);
      if (city && city !== 'all') params.append('city', city);
      if (status && status !== 'all') params.append('status', status);
      if (freshness && freshness !== 'all') params.append('freshness', freshness);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/hospitals?${params.toString()}`);
      const data = await res.json();
      if (data.hospitals) {
        setHospitals(data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, specialty, diagnosticTest, city, status, freshness, sortBy]);

  // Fetch Saved Hospital IDs for logged in user
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('careflow_token');
      fetch('/api/patient/saved', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.savedHospitals) {
            setSavedIds(data.savedHospitals.map((h) => h.id));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Trigger search on mount and when filter states change or when Socket.IO signals update
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals, updateCounter]);

  // Toggle Save
  const handleToggleSave = async (hospitalId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('careflow_token');
      const res = await fetch(`/api/patient/saved/${hospitalId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.saved) {
        setSavedIds((prev) => [...prev, hospitalId]);
      } else {
        setSavedIds((prev) => prev.filter((id) => id !== hospitalId));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  // Toggle Compare
  const handleToggleCompare = (hospital) => {
    setComparedHospitals((prev) => {
      const exists = prev.find((h) => h.id === hospital.id);
      if (exists) {
        return prev.filter((h) => h.id !== hospital.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 hospitals side by side.');
        return prev;
      }
      return [...prev, hospital];
    });
  };

  const handleLaunchCompare = () => {
    if (comparedHospitals.length === 0) return;
    const ids = comparedHospitals.map((h) => h.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-800">
            Reported Hospital Availability
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse verified medical centers in Varanasi & Bhadohi with real-time capacity and queues.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-gray-200/70 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-navy-800 shadow-xs'
                : 'text-gray-600 hover:text-navy-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-navy-800 shadow-xs'
                : 'text-gray-600 hover:text-navy-800'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Callout */}
      <SafetyNotice compact={true} />

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-gray-200 shadow-subtle space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by hospital name, address, or diagnostic tests..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* City */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="all">All Cities</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Bhadohi">Bhadohi</option>
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="all">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Paediatrics">Paediatrics</option>
              <option value="Gynaecology">Gynaecology</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Diagnostic Test */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Diagnostic Test
            </label>
            <select
              value={diagnosticTest}
              onChange={(e) => setDiagnosticTest(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="all">All Tests</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Blood Test">Blood Test</option>
              <option value="X-Ray">X-Ray</option>
            </select>
          </div>

          {/* Emergency Status */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Emergency Load
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="all">All Load Levels</option>
              <option value="Normal">Normal</option>
              <option value="Busy">Busy</option>
              <option value="Limited">Limited</option>
            </select>
          </div>

          {/* Freshness */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Freshness
            </label>
            <select
              value={freshness}
              onChange={(e) => setFreshness(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="all">All Freshness</option>
              <option value="live">Live (&lt;15m)</option>
              <option value="recent">Recent (&lt;60m)</option>
              <option value="aging">Aging (&lt;4h)</option>
              <option value="outdated">Outdated (&gt;4h)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-navy-800 focus:outline-none focus:ring-1 focus:ring-health-500"
            >
              <option value="wait">Shortest Est. Wait</option>
              <option value="distance">Nearest Distance</option>
              <option value="freshness">Most Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-card p-6 border border-gray-200 animate-pulse space-y-4"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="bg-white rounded-card p-12 text-center border border-gray-200 max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-navy-800">No hospitals found</h3>
          <p className="text-xs text-gray-500">
            No verified hospitals match the selected criteria. Try relaxing your filters or search query.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSpecialty('all');
              setDiagnosticTest('all');
              setCity('all');
              setStatus('all');
              setFreshness('all');
            }}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isSaved={savedIds.includes(hospital.id)}
              onToggleSave={handleToggleSave}
              isCompared={comparedHospitals.some((h) => h.id === hospital.id)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[600px]">
            <LeafletMap hospitals={hospitals} />
          </div>
          <div className="h-[600px] overflow-y-auto space-y-4 pr-1">
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                isSaved={savedIds.includes(hospital.id)}
                onToggleSave={handleToggleSave}
                isCompared={comparedHospitals.some((h) => h.id === hospital.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Compare Drawer */}
      {comparedHospitals.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-navy-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-navy-700 flex items-center gap-4 max-w-xl w-full mx-4 animate-in slide-in-from-bottom">
          <Scale className="w-5 h-5 text-health-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-white">
              Comparing ({comparedHospitals.length}/3) Hospitals
            </h5>
            <p className="text-[11px] text-gray-300 truncate">
              {comparedHospitals.map((h) => h.name).join(' vs ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparedHospitals([])}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleLaunchCompare}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-health-600 hover:bg-health-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <span>Compare Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
