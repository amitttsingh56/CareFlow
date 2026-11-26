import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffManagementPage = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');

  const fetchStaff = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/staff', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaff(data.staff);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/hospital/staff/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowInviteModal(false);
        setInviteSuccess(data.message);
        setName('');
        setEmail('');
        setTimeout(() => setInviteSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-health-600" />
            <h1 className="text-2xl font-bold text-navy-800">Operational Staff Management</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Authorize team members to update queues, doctors, and triage bed availability.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-900 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {inviteSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role Access</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-semibold text-navy-800">
                  {s.name}{' '}
                  {s.id === user.id && (
                    <span className="text-[10px] text-health-600 ml-1 font-bold">(You)</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{s.email}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
                    {s.hospitalRole || 'Editor'}
                  </span>
                </td>
                <td className="p-4 text-emerald-600 font-semibold">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-800">Invite Hospital Staff</h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nurse Priya Rai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@hospital.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Role Permissions
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                >
                  <option value="Editor">Editor (Can update queues, beds & doctors)</option>
                  <option value="Viewer">Viewer (Read-only dashboard access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-navy-800 text-white text-xs font-bold hover:bg-navy-900"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
