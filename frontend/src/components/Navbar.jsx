import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Search,
  Scale,
  Bookmark,
  Building2,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isHospital, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-health-500 shadow-sm transition-transform group-hover:scale-105">
                <Activity className="w-6 h-6 text-health-500 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-navy-800 leading-none">
                  Care<span className="text-health-600">Flow</span>
                </span>
                <span className="text-[11px] font-medium text-gray-500 leading-tight mt-0.5">
                  Know before you go
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-health-50 text-health-700 border border-health-100">
              <Sparkles className="w-3 h-3 text-health-600" />
              Live Capacity Intelligence
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/search"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/search')
                  ? 'bg-navy-800 text-white'
                  : 'text-gray-700 hover:text-navy-800 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Find Hospitals</span>
            </Link>

            <Link
              to="/compare"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/compare')
                  ? 'bg-navy-800 text-white'
                  : 'text-gray-700 hover:text-navy-800 hover:bg-gray-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
            </Link>

            <Link
              to="/saved"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/saved')
                  ? 'bg-navy-800 text-white'
                  : 'text-gray-700 hover:text-navy-800 hover:bg-gray-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </Link>

            {/* Portal Link based on user role */}
            {isHospital && (
              <Link
                to="/hospital/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/hospital')
                    ? 'bg-health-600 text-white shadow-sm'
                    : 'text-health-700 hover:bg-health-50 font-semibold'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hospital Portal</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-navy-800 hover:bg-gray-100 font-semibold'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Ops</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Side / Profile / Login */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-navy-800 hover:bg-gray-50"
                >
                  <User className="w-3.5 h-3.5 text-health-600" />
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-navy-800 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-health-600 text-white hover:bg-health-700 shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-navy-800 hover:bg-gray-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Find Hospitals
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Compare Hospitals
          </Link>
          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Saved Hospitals
          </Link>
          {isHospital && (
            <Link
              to="/hospital/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-health-600 bg-health-50"
            >
              Hospital Portal
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-navy-900 bg-gray-100"
            >
              Admin Operations Portal
            </Link>
          )}

          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-navy-800"
                >
                  My Profile ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-navy-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold bg-health-600 text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
