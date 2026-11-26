# CareFlow Investor Demonstration Script (5-Minute Walkthrough)

> **Tagline:** *"Know before you go."*  
> **Core Message:** *"Don't just find a hospital. Know its current capacity before you go."*  
> **Pilot Region:** Varanasi & Bhadohi Healthcare Cluster (Uttar Pradesh)  
> **Demo URL:** `http://localhost:5173`

---

## Pre-Demo Quick Checklist
1. Start the platform: `npm run dev`
2. Open `http://localhost:5173` in your browser.
3. Keep an Incognito or side-by-side browser window ready for the live Socket.IO update test.

---

## Walkthrough Timeline

### Minute 1: The Problem & Value Proposition (Landing Page)
- **What to show:**
  - Landing hero displaying the bold tagline **"Know before you go."** and core message.
  - The three core value pillars:
    1. *See Real Capacity* (Live OPD queues, ICU/General beds, emergency triage status).
    2. *Compare Options* (Neutral side-by-side matrix, patient chooses where to go).
    3. *Freshness You Can Trust* (Strict SLA timestamps, transparent data source attribution).
  - The prominent safety disclaimer:
    > *"For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information."*
  - The 6-step "How It Works" workflow explaining operational data collection to patient navigation.
- **Investor Talking Point:**
  > *"Patients in India travel blindly during healthcare emergencies only to encounter full ICUs or 3-hour OPD queues. CareFlow transforms hospital capacity from a black box into actionable operational intelligence before leaving home."*

---

### Minute 2: Patient Discovery & Interactive Map (Search & Compare)
- **What to show:**
  - Click **"Check Capacity"** or **"Find Hospitals"** in the top navigation.
  - Search by Department (e.g. *Cardiology*) or Diagnostic (e.g. *MRI*).
  - Point out the four standardized **Freshness Badges**:
    - `Live` (<15m) &bull; `Recent` (<60m) &bull; `Aging` (<4h) &bull; `⚠ Data may be outdated` (>4h).
  - Click **"Map View"** to show Leaflet OpenStreetMap tiles with color-coded pins:
    - **Green:** Normal load
    - **Amber:** Busy
    - **Red:** Limited capacity
  - Select 2 or 3 hospitals using the **"Compare"** checkbox and click **"Compare Now"**:
    - Side-by-side table comparing emergency load, estimated wait times, general/ICU beds, and on-duty doctors.
- **Investor Talking Point:**
  > *"Notice we never claim 'guaranteed beds'. We report verified facility updates with exact timestamps and staleness warnings. The patient compares and chooses."*

---

### Minute 3: Hospital Operational Deep-Dive (Detail Page)
- **What to show:**
  - Click into **Heritage Institute of Medical Sciences** or **Apex Super Speciality Hospital**.
  - Show the clean capacity breakdown:
    - **Emergency Triage Status:** Live load indicator.
    - **Reported Bed Availability:** General Ward, ICU, and Emergency beds with occupancy bars.
    - **OPD Queues & Wait Times:** Per-department waiting patient count and estimated turnaround.
    - **Specialist Doctor Availability:** Roster of on-duty specialists and next available consultation times.
    - **Diagnostic Lab Queues:** MRI, CT Scan, X-Ray, and Blood Test waiting times.
  - Click **"Get Directions"** (opens live navigation) and save the hospital to favorites.

---

### Minute 4: Hospital Staff Portal & Live Push Update (The Wow Factor!)
- **What to show:**
  - Open an Incognito window or second browser tab at `http://localhost:5173/login`.
  - Click the 1-Click Demo button: **"Hospital Staff 1 (Heritage)"**.
  - Review the Staff Dashboard:
    - Recharts hourly OPD waiting time trends.
    - Department queue load bar chart.
  - Navigate to **"Update Operational Status"**:
    - Change Emergency load from `Normal` to `Busy` with 1 click.
    - Update Cardiology queue wait time (e.g. 35 &rarr; 55 minutes).
    - Click **"Publish Live Availability"**.
  - **The Switch:** Look at the Patient window on the other screen:
    - **Instant Socket.IO update occurs without a page refresh!**
    - A subtle *"Live Capacity Updated"* toast appears and metrics re-render live.
  - Point out **Plan Feature Gating**:
    - Demonstrate how Starter hospitals only manage OPD queues, while Professional unlocks beds, diagnostics, and analytics (with upgrade CTA).
- **Investor Talking Point:**
  > *"Hospitals subscribe on a monthly SaaS basis to manage transparency and steer patient load away from overcrowded hours."*

---

### Minute 5: CareFlow Operations Hub & Governance (Admin Portal)
- **What to show:**
  - In the hospital tab, log out and sign in using **1-Click Admin Ops**.
  - **Operations Dashboard:** View total facilities, active patients, and stale records.
  - **Hospital Verification Queue:**
    - Notice *Kashi Medanta Multi Speciality Hospital* in `Pending` state.
    - Click **"Approve & Verify"** &rarr; The hospital instantly becomes `Verified` and appears on public patient searches!
  - **Data Quality & Staleness Monitor:**
    - Identifies hospitals exceeding the 4-hour SLA (e.g. *Triveni Hospital*).
    - Click **"Send Reminder"** &rarr; Simulated operational notification is dispatched and logged.
  - **Audit Trail:**
    - Show complete change history with actor name, timestamp, and before/after values.
  - **Reset Demo Data:**
    - Point out the 1-click reset button that returns the database to this pristine demo state at any time.

---

## Demo Credentials Reference

| Role | Email | Password | Pre-seeded Facility |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@careflow.demo` | `Admin@123` | CareFlow Platform Operations |
| **Hospital Staff 1** | `hospital1@careflow.demo` | `Hospital@123` | Heritage Institute of Medical Sciences (Professional) |
| **Hospital Staff 2** | `hospital2@careflow.demo` | `Hospital@123` | Apex Super Speciality Hospital (Professional) |
| **Patient User** | `patient@careflow.demo` | `Patient@123` | Public Registered Patient |

*All roles can be accessed instantly via the 1-click demo login buttons on `/login`.*
