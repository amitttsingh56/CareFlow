import React, { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HospitalProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.hospital) {
          setProfile(data.hospital);
          setName(data.hospital.name);
          setPhone(data.hospital.phone);
          setWebsite(data.hospital.website);
          setAddress(data.hospital.address);
          setPincode(data.hospital.pincode);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/hospital/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, website, address, pincode }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading hospital profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="w-6 h-6 text-health-600" />
        <h1 className="text-2xl font-bold text-navy-800">Hospital Facility Settings</h1>
      </div>

      <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hospital profile updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Hospital Full Registered Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Official Helpline / Desk Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Website / Web Portal
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
              <input
                type="text"
                value={profile?.city || 'Varanasi'}
                disabled
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">State</label>
              <input
                type="text"
                value={profile?.state || 'Uttar Pradesh'}
                disabled
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900 shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalProfilePage;
