import express from 'express';
import prisma from '../prisma.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { calculateFreshness } from './hospitals.js';
import { broadcastHospitalUpdate } from '../socket.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('hospital', 'admin'));

// Helper to get hospitalId for current user
const getHospitalId = (req) => {
  if (req.user.role === 'admin' && req.query.hospitalId) {
    return req.query.hospitalId;
  }
  return req.user.hospitalId;
};

// Hospital Dashboard Data
router.get('/dashboard', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    if (!hospitalId) {
      return res.status(400).json({ error: 'No associated hospital for this user' });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        departments: true,
        diagnostics: true,
        doctors: true,
        users: {
          select: { id: true, name: true, email: true, hospitalRole: true, createdAt: true },
        },
      },
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const freshness = calculateFreshness(hospital.lastUpdated);

    // Total patients waiting across all OPD departments
    const totalOPDWaiting = hospital.departments.reduce((sum, d) => sum + d.waitingCount, 0);

    // Hourly demand pattern for Recharts line chart (Illustrative demo data)
    const hourlyWaitTimes = [
      { time: '08:00', waitMinutes: 12, patients: 8 },
      { time: '09:00', waitMinutes: 24, patients: 18 },
      { time: '10:00', waitMinutes: 45, patients: 34 },
      { time: '11:00', waitMinutes: 52, patients: 42 },
      { time: '12:00', waitMinutes: 48, patients: 38 },
      { time: '13:00', waitMinutes: 30, patients: 22 },
      { time: '14:00', waitMinutes: 25, patients: 19 },
      { time: '15:00', waitMinutes: 38, patients: 28 },
      { time: '16:00', waitMinutes: 42, patients: 31 },
      { time: '17:00', waitMinutes: 28, patients: 20 },
      { time: '18:00', waitMinutes: 18, patients: 12 },
    ];

    // Department Load for Recharts Bar Chart
    const departmentLoad = hospital.departments.map((d) => ({
      name: d.departmentName,
      waiting: d.waitingCount,
      estimatedWait: d.estimatedWaitMins,
      capacityThreshold: 25,
    }));

    res.json({
      hospital,
      freshness,
      totalOPDWaiting,
      hourlyWaitTimes,
      departmentLoad,
      planFeatures: {
        isStarter: hospital.plan === 'Starter',
        isProfessional: hospital.plan === 'Professional',
        hasBedsManagement: hospital.plan === 'Professional',
        hasDiagnosticsManagement: hospital.plan === 'Professional',
        hasAnalytics: hospital.plan === 'Professional',
      },
      isIllustrative: true,
    });
  } catch (err) {
    console.error('Hospital dashboard error:', err);
    res.status(500).json({ error: 'Failed to load hospital dashboard' });
  }
});

// Update Operational Status (Emergency, OPD queues, Beds, Diagnostics)
router.post('/status', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: { departments: true, diagnostics: true },
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const {
      emergencyStatus,
      generalBedsAvailable,
      icuBedsAvailable,
      emergencyBedsAvailable,
      departments,
      diagnostics,
    } = req.body;

    const beforeState = {
      emergencyStatus: hospital.emergencyStatus,
      generalBedsAvailable: hospital.generalBedsAvailable,
      icuBedsAvailable: hospital.icuBedsAvailable,
      emergencyBedsAvailable: hospital.emergencyBedsAvailable,
    };

    const updateData = {
      lastUpdated: new Date(),
      lastUpdatedBy: req.user.name,
      dataSource: 'Hospital dashboard',
    };

    if (emergencyStatus) updateData.emergencyStatus = emergencyStatus;

    // Bed counts (Enforce Professional plan for bed management)
    if (hospital.plan === 'Professional') {
      if (generalBedsAvailable !== undefined) updateData.generalBedsAvailable = parseInt(generalBedsAvailable, 10);
      if (icuBedsAvailable !== undefined) updateData.icuBedsAvailable = parseInt(icuBedsAvailable, 10);
      if (emergencyBedsAvailable !== undefined) updateData.emergencyBedsAvailable = parseInt(emergencyBedsAvailable, 10);
    }

    // Update hospital record
    const updatedHospital = await prisma.hospital.update({
      where: { id: hospitalId },
      data: updateData,
    });

    // Update OPD departments
    if (departments && Array.isArray(departments)) {
      for (const dept of departments) {
        if (dept.id) {
          await prisma.departmentQueue.update({
            where: { id: dept.id },
            data: {
              waitingCount: parseInt(dept.waitingCount || 0, 10),
              estimatedWaitMins: parseInt(dept.estimatedWaitMins || 0, 10),
              lastUpdated: new Date(),
            },
          });
        }
      }
    }

    // Update Diagnostics (Professional plan only)
    if (hospital.plan === 'Professional' && diagnostics && Array.isArray(diagnostics)) {
      for (const diag of diagnostics) {
        if (diag.id) {
          await prisma.diagnosticQueue.update({
            where: { id: diag.id },
            data: {
              waitingCount: parseInt(diag.waitingCount || 0, 10),
              estimatedWaitMins: parseInt(diag.estimatedWaitMins || 0, 10),
              lastUpdated: new Date(),
            },
          });
        }
      }
    }

    // Audit Log entry
    await prisma.auditLog.create({
      data: {
        action: 'STATUS_UPDATE',
        entityType: 'Hospital',
        entityId: hospitalId,
        performedByName: req.user.name,
        details: `Operational status updated by ${req.user.name}`,
        beforeValues: JSON.stringify(beforeState),
        afterValues: JSON.stringify(updateData),
      },
    });

    // Broadcast live update over Socket.IO to all patients!
    broadcastHospitalUpdate(hospitalId, updatedHospital);

    res.json({
      success: true,
      message: 'Hospital reported availability updated successfully.',
      hospital: updatedHospital,
      lastUpdated: updateData.lastUpdated,
      lastUpdatedBy: updateData.lastUpdatedBy,
    });
  } catch (err) {
    console.error('Error updating hospital status:', err);
    res.status(500).json({ error: 'Failed to update hospital operational status' });
  }
});

// Doctors list and toggle
router.get('/doctors', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const doctors = await prisma.doctor.findMany({
      where: { hospitalId },
      orderBy: { specialty: 'asc' },
    });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.put('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, nextAvailable } = req.body;

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Doctor not found' });

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        status: status || existing.status,
        nextAvailable: nextAvailable !== undefined ? nextAvailable : existing.nextAvailable,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'DOCTOR_UPDATE',
        entityType: 'Hospital',
        entityId: existing.hospitalId,
        performedByName: req.user.name,
        details: `Updated status for ${doctor.name} to ${doctor.status}`,
        beforeValues: JSON.stringify({ status: existing.status }),
        afterValues: JSON.stringify({ status: doctor.status }),
      },
    });

    broadcastHospitalUpdate(existing.hospitalId, { doctorUpdated: doctor });

    res.json({ doctor, message: 'Doctor availability updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const { name, specialty, status, roomNumber, nextAvailable } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ error: 'Doctor name and specialty are required' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        hospitalId,
        name,
        specialty,
        status: status || 'On duty',
        roomNumber: roomNumber || 'OPD',
        nextAvailable: nextAvailable || 'Immediate',
      },
    });

    broadcastHospitalUpdate(hospitalId, { doctorAdded: doctor });
    res.status(201).json({ doctor, message: 'Doctor added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const { name, phone, website, address, pincode } = req.body;

    const updated = await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        name,
        phone,
        website,
        address,
        pincode,
      },
    });

    res.json({ hospital: updated, message: 'Hospital profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hospital profile' });
  }
});

// Subscription / Upgrade
router.get('/subscription', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    res.json({
      currentPlan: hospital.plan,
      pricingNotice: 'Initial pricing hypothesis, not validated market prices.',
      plans: [
        {
          id: 'Starter',
          name: 'Starter Plan',
          priceMonthly: '₹10,000 / month',
          features: [
            'Hospital Profile & Verified Badge',
            'Doctor On-Duty / Off-Duty Directory',
            'Manual OPD Queue Updates',
            'Live Patient Visibility',
            '1 Staff User Account',
          ],
          isCurrent: hospital.plan === 'Starter',
        },
        {
          id: 'Professional',
          name: 'Professional Plan',
          priceMonthly: '₹25,000 / month',
          badge: 'Most Popular',
          features: [
            'Everything in Starter',
            'Real-Time Bed Availability (General, ICU, Emergency)',
            'Diagnostic Lab Queues (MRI, CT Scan, X-Ray, Blood Test)',
            'Advanced Hourly Demand Analytics & Trends',
            'Multi-Staff Role Management (Editors & Viewers)',
            'Priority Support & Emergency Status Broadcast',
          ],
          isCurrent: hospital.plan === 'Professional',
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subscription details' });
  }
});

router.post('/subscription/upgrade', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });

    const updated = await prisma.hospital.update({
      where: { id: hospitalId },
      data: { plan: 'Professional' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PLAN_CHANGE',
        entityType: 'Subscription',
        entityId: hospitalId,
        performedByName: req.user.name,
        details: 'Simulated checkout upgrade to Professional Plan (₹25,000/mo hypothesis)',
        beforeValues: JSON.stringify({ plan: hospital.plan }),
        afterValues: JSON.stringify({ plan: 'Professional' }),
      },
    });

    broadcastHospitalUpdate(hospitalId, { plan: 'Professional' });

    res.json({
      success: true,
      message: 'Plan upgraded to Professional Plan successfully! All premium features unlocked.',
      hospital: updated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
});

// Staff Management
router.get('/staff', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const staff = await prisma.user.findMany({
      where: { hospitalId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hospitalRole: true,
        createdAt: true,
      },
    });

    res.json({ staff });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
});

router.post('/staff/invite', async (req, res) => {
  try {
    const hospitalId = getHospitalId(req);
    const { email, name, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    await prisma.auditLog.create({
      data: {
        action: 'STAFF_INVITE',
        entityType: 'Hospital',
        entityId: hospitalId,
        performedByName: req.user.name,
        details: `Simulated invitation sent to ${name} (${email}) as ${role || 'Editor'}`,
        afterValues: JSON.stringify({ email, name, role: role || 'Editor' }),
      },
    });

    res.json({
      success: true,
      message: `Invitation successfully sent to ${email} as ${role || 'Editor'} (Simulated delivery).`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

export default router;
