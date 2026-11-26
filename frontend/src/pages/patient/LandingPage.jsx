import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Activity,
  Bed,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck2,
  Navigation,
} from 'lucide-react';
import { SafetyNotice } from '../../components/SafetyNotice';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { StatusChip } from '../../components/StatusChip';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [platformContent, setPlatformContent] = useState({
    headline: 'Know before you go.',
    subheadline: "Don't just find a hospital. Know its current capacity before you go.",
  });

  useEffect(() => {
    // Fetch preview hospitals and platform headline
    fetch('/api/hospitals?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (data.hospitals) {
          setFeaturedHospitals(data.hospitals.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/hospitals/content/platform')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setPlatformContent(data.content);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedSpecialty) params.append('specialty', selectedSpecialty);
    navigate(`/search?${params.toString()}`);
  };

  const specialtiesList = [
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'General Medicine',
    'Paediatrics',
    'Emergency',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-health-50 border border-health-100 text-xs font-semibold text-health-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hospital Capacity & Queue Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.1]">
              {platformContent.headline}
            </h1>

            {/* Core Message */}
            <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
              "{platformContent.subheadline}"
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-2 rounded-2xl bg-white border-2 border-navy-800 shadow-card flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 flex items-center px-3 gap-2 border-b sm:border-b-0 sm:border-r border-gray-200 py-2 sm:py-0">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Hospital name, address, MRI, CT scan..."
                  className="w-full text-sm outline-none text-navy-800 placeholder-gray-400 bg-transparent"
                />
              </div>

              <div className="sm:w-48 px-2 py-1">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer py-2"
                >
                  <option value="">All Specialties</option>
                  {specialtiesList.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-health-600 text-white font-semibold text-sm hover:bg-health-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Check Capacity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Specialty Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-gray-400 font-medium">Quick search:</span>
              {specialtiesList.slice(0, 4).map((spec) => (
                <button
                  key={spec}
                  onClick={() => navigate(`/search?specialty=${spec}`)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {spec}
                </button>
              ))}
              <button
                onClick={() => navigate('/search?test=MRI')}
                className="px-3 py-1 rounded-full text-xs font-medium bg-health-50 text-health-700 hover:bg-health-100 transition-colors"
              >
                MRI Scan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Safety Notice Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SafetyNotice />
      </div>

      {/* 3 Core Value Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800">
            Real Operational Transparency
          </h2>
          <p className="text-sm text-gray-500">
            CareFlow replaces guessing with structured, verified operational data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-card border border-gray-200 shadow-subtle hover:shadow-card transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-800">See Current Capacity</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Check OPD queues by specialty, emergency department status, and reported available beds (General, ICU, Emergency) before heading out.
            </p>
            <div className="pt-2 text-xs font-semibold text-health-600 flex items-center gap-1">
              <span>View live OPD wait times</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-card border border-gray-200 shadow-subtle hover:shadow-card transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-800">Compare Options</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Compare up to three medical centers side-by-side on emergency load, bed counts, estimated queues, and distance. You compare and choose.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>Neutral side-by-side matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-card border border-gray-200 shadow-subtle hover:shadow-card transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-navy-800">Freshness You Can Trust</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every value shows an exact timestamp and source. Automatic badges clearly flag Live, Recent, Aging, or Outdated records over 4 hours.
            </p>
            <div className="pt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Transparent timestamps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Pilot Hospitals in Varanasi / Bhadohi Area */}
      {featuredHospitals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-health-600">
                Pilot Region: Varanasi & Bhadohi Area
              </span>
              <h2 className="text-2xl font-bold text-navy-800 mt-1">
                Live Reported Hospital Availability
              </h2>
            </div>
            <Link
              to="/search"
              className="text-xs font-semibold text-health-600 hover:text-health-700 flex items-center gap-1"
            >
              <span>Explore all 10 pilot facilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-card border border-gray-200 p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <FreshnessBadge freshness={hosp.freshness} />
                    <StatusChip status={hosp.emergencyStatus} type="emergency" />
                  </div>
                  <h3 className="text-base font-bold text-navy-800 line-clamp-1">
                    <Link to={`/hospitals/${hosp.id}`}>{hosp.name}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{hosp.address}, {hosp.city}</span>
                  </p>
                </div>

                <div className="my-4 py-3 border-y border-gray-100 grid grid-cols-2 gap-2 text-center bg-gray-50/70 rounded-xl">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Est. OPD Wait</span>
                    <strong className="text-xs text-navy-800">
                      ~{hosp.avgDeptWaitMins || 20} min
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Gen Beds Avail</span>
                    <strong className="text-xs text-emerald-600">
                      {hosp.generalBedsAvailable} beds
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/hospitals/${hosp.id}`}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-navy-800 text-white hover:bg-navy-900 transition-colors text-center"
                >
                  View Details & Queues
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it Works: 6-Step Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-health-500">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              How CareFlow Works in 6 Steps
            </h2>
            <p className="text-xs text-gray-300">
              From finding emergency load to reaching the right desk smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="text-base font-bold text-white">Search by Need</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Enter hospital name, specialty (Cardiology, Orthopedics, Paediatrics), or diagnostic test (MRI, CT Scan).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="text-base font-bold text-white">Inspect Capacity</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Review estimated OPD queues, on-duty specialist doctors, and reported bed counts (General, ICU, Emergency).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="text-base font-bold text-white">Verify Freshness</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Check the last updated timestamp and freshness level (Live, Recent, Aging, or Outdated) published directly by staff.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="text-base font-bold text-white">Compare Side-by-Side</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Select up to three hospitals to compare emergency status, waiting time, distance, and bed availability in one matrix.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                5
              </div>
              <h4 className="text-base font-bold text-white">Get Directions</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Open directions directly on OpenStreetMap or Google Maps and view emergency contact numbers.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-navy-800/80 p-6 rounded-card border border-navy-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-health-600 text-white font-bold flex items-center justify-center text-sm">
                6
              </div>
              <h4 className="text-base font-bold text-white">Stay Updated Live</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Receive real-time push events if hospital emergency status or triage levels change while you travel.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-health-600 text-white font-semibold text-sm hover:bg-health-700 transition-colors shadow-lg"
            >
              <span>Get Started &bull; Find Hospitals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
