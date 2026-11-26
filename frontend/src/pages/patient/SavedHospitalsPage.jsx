import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, AlertCircle, ArrowRight } from 'lucide-react';
import { HospitalCard } from '../../components/HospitalCard';
import { useAuth } from '../../context/AuthContext';

export const SavedHospitalsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('careflow_token');
    fetch('/api/patient/saved', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.savedHospitals) {
          setSavedHospitals(data.savedHospitals);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggleSave = async (hospitalId) => {
    const token = localStorage.getItem('careflow_token');
    try {
      await fetch(`/api/patient/saved/${hospitalId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-card border border-gray-200 text-center space-y-4 shadow-card">
        <Bookmark className="w-12 h-12 text-health-600 mx-auto" />
        <h2 className="text-lg font-bold text-navy-800">Sign in to view saved hospitals</h2>
        <p className="text-xs text-gray-500">
          Save your frequently visited hospitals or emergency centers for quick capacity checks.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-health-600 text-white rounded-xl text-xs font-semibold hover:bg-health-700"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="w-6 h-6 text-health-600 fill-health-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-800">Saved Hospitals</h1>
      </div>

      {loading ? (
        <div className="text-xs text-gray-400 p-8 text-center">Loading your saved hospitals...</div>
      ) : savedHospitals.length === 0 ? (
        <div className="bg-white p-12 rounded-card text-center border border-gray-200 max-w-md mx-auto space-y-3">
          <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-navy-800">No saved hospitals yet</h3>
          <p className="text-xs text-gray-500">
            Bookmark hospitals from search or detail pages to track their live capacity right here.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white rounded-xl text-xs font-semibold"
          >
            <span>Explore Hospitals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedHospitalsPage;
