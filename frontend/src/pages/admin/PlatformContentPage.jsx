import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, Save, CheckCircle2 } from 'lucide-react';

export const PlatformContentPage = () => {
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [safetyDisclaimer, setSafetyDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/admin/content', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setHeadline(data.content.headline);
          setSubheadline(data.content.subheadline);
          setSafetyDisclaimer(data.content.safetyDisclaimer);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ headline, subheadline, safetyDisclaimer }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Public copy and safety disclaimer updated across CareFlow platform.');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading platform copy settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-health-600" />
            <h1 className="text-2xl font-bold text-navy-800">Public Platform Copy & Safety Policy</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure landing page copy and enforce mandatory patient safety and emergency disclaimers.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="text-xs font-semibold text-gray-500 hover:text-navy-800 self-start sm:self-auto"
        >
          &larr; Back to Ops Hub
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Landing Page Main Headline
          </label>
          <input
            type="text"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500 font-bold text-navy-800"
          />
          <span className="text-[11px] text-gray-400">Default: "Know before you go."</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Landing Page Subheadline / Core Message
          </label>
          <input
            type="text"
            required
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500 text-gray-700"
          />
          <span className="text-[11px] text-gray-400">
            Default: "Don't just find a hospital. Know its current capacity before you go."
          </span>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Mandatory Emergency Guidance & Disclaimer
          </label>
          <textarea
            rows={3}
            required
            value={safetyDisclaimer}
            onChange={(e) => setSafetyDisclaimer(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-health-500 text-gray-700 leading-relaxed"
          />
          <span className="text-[11px] text-gray-400 block mt-0.5">
            Displayed on every patient hospital card and detail view. Enforced across all mobile and web layouts.
          </span>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900 shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Copy...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlatformContentPage;
