import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveToast } from './components/LiveToast';

// Patient Pages
import LandingPage from './pages/patient/LandingPage';
import SearchPage from './pages/patient/SearchPage';
import HospitalDetailPage from './pages/patient/HospitalDetailPage';
import ComparePage from './pages/patient/ComparePage';
import SavedHospitalsPage from './pages/patient/SavedHospitalsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Hospital Portal Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import StatusUpdatePage from './pages/hospital/StatusUpdatePage';
import DoctorAvailabilityPage from './pages/hospital/DoctorAvailabilityPage';
import HospitalAnalyticsPage from './pages/hospital/HospitalAnalyticsPage';
import HospitalProfilePage from './pages/hospital/HospitalProfilePage';
import SubscriptionPage from './pages/hospital/SubscriptionPage';
import StaffManagementPage from './pages/hospital/StaffManagementPage';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalVerificationPage from './pages/admin/HospitalVerificationPage';
import HospitalManagementPage from './pages/admin/HospitalManagementPage';
import DataQualityMonitorPage from './pages/admin/DataQualityMonitorPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import PlatformContentPage from './pages/admin/PlatformContentPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Role-based Route Protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-500">
        Verifying authorization credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert(`Access restricted. You do not have permissions for this portal. Logged in as: ${user.role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-surface">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public / Patient Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/saved" element={<SavedHospitalsPage />} />
                <Route path="/profile" element={<PatientProfilePage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Hospital Portal Routes */}
                <Route
                  path="/hospital/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/status"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <StatusUpdatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/doctors"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <DoctorAvailabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <HospitalAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/profile"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <HospitalProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/subscription"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/staff"
                  element={
                    <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                      <StaffManagementPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HospitalVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/hospitals"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HospitalManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/data-quality"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DataQualityMonitorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PlatformContentPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <LiveToast />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
