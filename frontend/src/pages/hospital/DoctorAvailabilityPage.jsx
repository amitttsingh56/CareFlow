import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Plus, CheckCircle2, UserCheck, UserX, Clock } from 'lucide-react';
import { StatusChip } from '../../components/StatusChip';
import { useAuth } from '../../context/AuthContext';

export const DoctorAvailabilityPage = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doctor form
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [status, setStatus] = useState('On duty');
  const [roomNumber, setRoomNumber] = useState('OPD-101');
  const [nextAvailable, setNextAvailable] = useState('Immediate');

  const fetchDoctors = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/doctors', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.doctors) setDoctors(data.doctors);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    let newStatus = 'On duty';
    if (currentStatus === 'On duty') newStatus = 'Off duty';
    else if (currentStatus === 'Off duty') newStatus = 'On leave';
    else if (currentStatus === 'On leave') newStatus = 'On duty';

    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch(`/api/hospital/doctors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/hospital/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, specialty, status, roomNumber, nextAvailable }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Specialist Doctor Availability</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage duty rosters so patients know which specialists are on site before arriving.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Specialist Doctor</span>
        </button>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="text-xs text-gray-400 p-8 text-center">Loading specialist roster...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-card p-5 border border-gray-200 shadow-subtle space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-navy-800">{doc.name}</h3>
                    <p className="text-xs text-health-600 font-semibold">{doc.specialty}</p>
                  </div>
                  <StatusChip status={doc.status} type="doctor" />
                </div>

                <div className="text-xs text-gray-500 space-y-1 pt-3">
                  <div>Room: {doc.roomNumber || 'General OPD'}</div>
                  <div>Next Available: {doc.nextAvailable || 'Immediate'}</div>
                </div>
              </div>

              {/* Status Toggle Action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Click to cycle status:</span>
                <button
                  onClick={() => handleToggleStatus(doc.id, doc.status)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-navy-800 hover:bg-gray-50 transition-colors"
                >
                  Toggle ({doc.status})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-800">Add Specialist Doctor</h3>

            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Paediatrics">Paediatrics</option>
                  <option value="Gynaecology">Gynaecology</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                >
                  <option value="On duty">On duty</option>
                  <option value="Off duty">Off duty</option>
                  <option value="On leave">On leave</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Room Number / OPD Chamber
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-navy-800 text-white text-xs font-bold hover:bg-navy-900"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityPage;
