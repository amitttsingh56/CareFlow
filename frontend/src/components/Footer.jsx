import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, HeartHandshake, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white mt-16 border-t border-navy-800">
      {/* Top Banner Notice */}
      <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-3 text-center text-xs text-amber-200">
        <span className="font-semibold text-amber-100">Emergency Guidance:</span> For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-health-500">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Care<span className="text-health-500">Flow</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong>Know before you go.</strong> Don't just find a hospital. Know its current capacity before you go.
            </p>
            <p className="text-xs text-gray-400">
              Operational queue intelligence empowering patients to compare and choose with verified transparency.
            </p>
          </div>

          {/* Patient Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Patients</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Find Capacity Near Me
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Side-by-Side Hospital Compare
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">
                  Saved Hospitals
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Patient Account Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Hospitals & Staff */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Hospital Portal</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Hospital Staff Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register Hospital & Select Plan
                </Link>
              </li>
              <li>
                <Link to="/hospital/dashboard" className="hover:text-white transition-colors">
                  Operational Dashboard
                </Link>
              </li>
              <li>
                <Link to="/hospital/status" className="hover:text-white transition-colors">
                  1-Click Status & Queue Publishing
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Legal Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Governance & Safety</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>No diagnosis or treatment advice</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-health-500 shrink-0" />
                <span>Reported availability & estimates only</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified medical facility sources</span>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Admin Platform Operations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="mt-10 pt-6 border-t border-navy-800 text-xs text-gray-400 space-y-2">
          <p className="leading-relaxed">
            <span className="font-semibold text-gray-300">Disclaimer:</span> CareFlow does not guarantee beds or waiting times. All metrics reflect reported availability, estimated waiting times, and last updated timestamps from participating hospitals. Values are subject to rapid operational change. Mark: <em>Illustrative demo data</em>. Pricing shown represents an <em>initial pricing hypothesis, not validated market prices</em>.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-500 text-[11px] pt-2">
            <p>&copy; {new Date().getFullYear()} CareFlow Technologies. All rights reserved.</p>
            <p>Varanasi / Bhadohi Healthcare Intelligence Pilot</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
