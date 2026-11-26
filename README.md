# CareFlow — Hospital Capacity & Queue Intelligence Platform

> **Tagline:** *"Know before you go."*  
> **Core Message:** *"Don't just find a hospital. Know its current capacity before you go."*

CareFlow is a full-stack, multi-role operational transparency platform for healthcare facilities. Patients view real-time reported availability, OPD queue lengths, on-duty specialist doctors, and diagnostic waiting times before travelling. Hospitals manage capacity and subscribe via SaaS tiers, while platform administrators verify facilities and monitor data quality.

---

## Key Features

### 1. Patient Portal (Public, Free)
- **Search & Filters:** Search by hospital name, specialty (*Cardiology, Orthopedics, Neurology, Emergency, General Medicine, Paediatrics, Gynaecology*), or diagnostic test (*MRI, CT Scan, Blood Test, X-Ray*). Filter by city, load status, and freshness.
- **Interactive OpenStreetMap (Leaflet):** Color-coded map markers reflecting emergency load (Green = Normal, Amber = Busy, Red = Limited).
- **Hospital Capacity Deep-Dive:**
  - Real-time OPD department queues with estimated wait minutes.
  - Reported bed counts: General Ward, ICU, and Emergency beds with capacity utilization.
  - Specialist doctor availability roster (On duty / Off duty / On leave).
  - Diagnostic laboratory wait estimates.
- **Side-by-Side Comparison:** Compare up to 3 hospitals simultaneously.
- **Saved Hospitals & Profile:** Bookmark critical centers for 1-click access.
- **Real-Time Live Updates:** Socket.IO pushes live operational changes to patient screens without requiring a manual refresh.

### 2. Hospital Portal (Paid SaaS Subscription)
- **Operational Dashboard:** Key metrics cards, Recharts hourly OPD wait time trends, and department queue load distributions.
- **1-Click Status Publishing:** Instantly update Emergency Triage status, OPD queues, bed availability, and diagnostic times.
- **Doctor Roster Management:** Toggle duty status for specialists.
- **Plan Feature Gating:**
  - **Starter Tier (₹10,000 / month hypothesis):** Hospital profile, verified badge, manual OPD queues, doctor roster.
  - **Professional Tier (₹25,000 / month hypothesis):** Bed counts, diagnostic queues, hourly demand analytics, multi-staff access.
- **Simulated Subscription Checkout:** Upgrade modal with instant feature unlock.
- **Staff Management:** Invite staff members with Editor or Viewer roles.

### 3. Admin Operations Portal
- **Operations Hub:** Real-time KPI summary (total facilities, pending verifications, stale records, active accounts).
- **Hospital Verification Queue:** Review submitted medical licenses; approving a hospital instantly publishes it to patients.
- **Facility Management:** Suspend, reactivate, or alter subscription tiers.
- **Data Quality & Staleness Monitor:** Flags facilities exceeding the 4-hour SLA and allows 1-click reminder dispatches.
- **Immutable Audit Trail:** Complete audit logs tracking all operational updates and verification decisions with diffs.
- **Platform Copy Control:** Live configuration of landing headlines and safety disclaimers.
- **1-Click Reset Demo Data:** Restores all 10 hospitals and initial state at any time.

---

## Mandatory Safety & Wording Policies
- **Strict Terminology:** All capacity is described as *"Reported availability"*, *"Estimated waiting time"*, and *"Subject to change"*. We never write *"guaranteed"*, *"confirmed bed"*, or *"guaranteed wait"*.
- **Freshness Classification:**
  - `Live`: Updated within the last 15 minutes.
  - `Recent`: Updated within 15 to 60 minutes.
  - `Aging`: Updated within 1 to 4 hours.
  - `Outdated`: Exceeding 4 hours, displaying a `⚠ Data may be outdated` warning badge.
- **Mandatory Safety Notice:** Displayed on all cards and detail views:
  > *"For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information."*
- **Illustrative Disclaimers:** All demo metrics marked *"Illustrative demo data"*. Pricing marked *"Initial pricing hypothesis, not validated market prices"*.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, Leaflet, React-Leaflet, Socket.IO Client.
- **Backend:** Node.js, Express, Socket.IO, Prisma ORM, SQLite (`file:./dev.db`), bcryptjs, jsonwebtoken.
- **Tooling:** Concurrently for unified one-command execution.

---

## Quick Start (Zero-Setup)

### Prerequisites
- Node.js (v18+) and npm.

### Installation & Launch
From the root folder:

```bash
# 1. Install root, backend, and frontend dependencies
npm install

# 2. Run both backend and frontend servers together
npm run dev
```

The application will start immediately:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API & Socket:** [http://localhost:5000](http://localhost:5000)

*The SQLite database is auto-created and pre-seeded on first run with 10 realistic hospitals across Varanasi and Bhadohi, complete with departments, diagnostics, doctors, and users.*

---

## Pre-Seeded Demo Accounts

You can log in with any of these accounts or use the **1-Click Demo Login Panel** directly on the Login page:

| Role | Email | Password | Facility Assigned |
| :--- | :--- | :--- | :--- |
| **Admin Operations** | `admin@careflow.demo` | `Admin@123` | CareFlow Central Platform |
| **Hospital Staff 1** | `hospital1@careflow.demo` | `Hospital@123` | Heritage Institute of Medical Sciences (Professional) |
| **Hospital Staff 2** | `hospital2@careflow.demo` | `Hospital@123` | Apex Super Speciality Hospital (Professional) |
| **Patient User** | `patient@careflow.demo` | `Patient@123` | Public Registered Patient |

---

## Project Structure

```
CareFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite schema (User, Hospital, Queues, Doctors, Audit)
│   │   └── seed.js             # Realistic 10-hospital seed data for Varanasi/Bhadohi
│   ├── src/
│   │   ├── index.js            # Express server, Socket.IO initialization, auto-seed
│   │   ├── socket.js           # Real-time WebSocket broadcasting helpers
│   │   ├── prisma.js           # Prisma client instance
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification and RBAC guards
│   │   └── routes/
│   │       ├── auth.js         # Login, Register, Me, and 1-Click Demo Login
│   │       ├── hospitals.js    # Public hospital listings, search, map, compare, details
│   │       ├── hospitalPortal.js # Staff operational dashboard, queue editing, doctor roster
│   │       ├── adminPortal.js  # Stats, verifications, facility control, staleness monitor
│   │       └── patientPortal.js# Saved hospitals, patient profile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # FreshnessBadge, StatusChip, SafetyNotice, LeafletMap, etc.
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── patient/        # LandingPage, SearchPage, HospitalDetailPage, ComparePage, etc.
│   │   │   ├── hospital/       # HospitalDashboard, StatusUpdatePage, Doctors, Analytics, etc.
│   │   │   ├── admin/          # AdminDashboard, VerificationQueue, Management, DataQuality, etc.
│   │   │   └── auth/           # LoginPage, RegisterPage
│   │   ├── App.jsx             # React Router with ProtectedRoute role guards
│   │   └── index.css           # Tailwind CSS and Leaflet styles
│   ├── vite.config.js          # API and WebSocket proxy configuration
│   └── package.json
├── DEMO_SCRIPT.md              # 5-minute step-by-step investor demonstration guide
├── README.md                   # Project documentation
└── package.json                # Root concurrent execution script
```

---

## Verification & Compliance Checklist

- [x] Multi-role web app (Patient, Hospital, Admin) with role-protected routes.
- [x] Real-time Socket.IO synchronization on hospital updates.
- [x] Interactive Leaflet OpenStreetMap with color-coded pins by emergency status.
- [x] Freshness SLA badges (`Live`, `Recent`, `Aging`, `Outdated`).
- [x] Mandatory safety notices on all patient-facing surfaces.
- [x] 10 pre-seeded hospitals in Varanasi & Bhadohi with realistic queues, beds, and doctors.
- [x] 1-Click demo login panel and 1-Click demo reset capability.
- [x] Subscription tier gating (Starter vs Professional).
