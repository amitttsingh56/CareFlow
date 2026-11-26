import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  User,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient'); // 'patient' | 'hospital'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Varanasi');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Starter');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      if (role === 'hospital') {
        payload.hospitalDetails = {
          name: hospitalName,
          regNumber,
          address,
          city,
          phone,
          plan,
        };
      }

      const user = await register(payload);
      if (user.role === 'hospital') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/search');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-navy-800 text-health-500 flex items-center justify-center mx-auto shadow-sm">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-bold text-navy-800">Create CareFlow Account</h1>
        <p className="text-xs text-gray-500">
          Join the hospital capacity and queue intelligence network.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-gray-200/80 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            role === 'patient'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-600 hover:text-navy-800'
          }`}
        >
          <User className="w-4 h-4 text-health-600" />
          <span>Patient Account (Free)</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('hospital')}
          className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            role === 'hospital'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-gray-600 hover:text-navy-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Hospital Portal (Staff)</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {role === 'hospital' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Newly registered hospitals enter <strong>Pending verification</strong> status and are reviewed by CareFlow operations before appearing on public patient searches.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Your Full Name (Staff / Patient)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Sharma or Rohit Gupta"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@careflow.demo"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>

          {/* Hospital-specific Registration Fields */}
          {role === 'hospital' && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800">
                Hospital Facility Details
              </h4>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Hospital Registered Name
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. City Life Care Hospital"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Registration / License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="UP-MED-2024-XXXX"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 542 000 0000"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Physical Address & Landmark
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Station Road / Bypass Highway"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Bhadohi">Bhadohi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-200 font-semibold"
                  >
                    <option value="Starter">Starter (₹10,000/mo hypothesis)</option>
                    <option value="Professional">Professional (₹25,000/mo hypothesis)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900 transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Registering Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-health-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
