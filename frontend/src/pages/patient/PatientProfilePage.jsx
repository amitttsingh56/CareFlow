import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Bookmark, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileData, setProfileData] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/patient/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfileData(data.user);
          setName(data.user.name);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: data.user.name });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-800">{user?.name}</h1>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile name updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
            />
            <span className="text-[11px] text-gray-400">Email cannot be modified directly</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/saved"
              className="text-xs font-semibold text-health-600 hover:text-health-700 flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>View Saved Hospitals ({profileData?.savedCount || 0})</span>
            </Link>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfilePage;
