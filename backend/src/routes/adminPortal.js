import express from 'express';
import prisma from '../prisma.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { calculateFreshness } from './hospitals.js';
import { seedDatabase } from '../../prisma/seed.js';
import { broadcastHospitalUpdate } from '../socket.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('admin'));

// Admin Dashboard Summary
router.get('/stats', async (req, res) => {
  try {
    const totalHospitals = await prisma.hospital.count();
    const pendingVerifications = await prisma.hospital.count({ where: { status: 'Pending' } });
    const verifiedHospitals = await prisma.hospital.count({ where: { status: 'Verified' } });
    const suspendedHospitals = await prisma.hospital.count({ where: { status: 'Suspended' } });
    const totalPatients = await prisma.user.count({ where: { role: 'patient' } });

    // Hospitals with stale data (> 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const staleHospitalsCount = await prisma.hospital.count({
      where: {
        status: 'Verified',
        lastUpdated: { lt: fourHoursAgo },
      },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      stats: {
        totalHospitals,
        verifiedHospitals,
        pendingVerifications,
        suspendedHospitals,
        staleHospitalsCount,
        totalPatients,
      },
      recentActivity: recentAuditLogs,
      isIllustrative: true,
    });
  } catch (err) {
    console.error('Error in admin stats:', err);
    res.status(500).json({ error: 'Failed to load admin stats' });
  }
});

// Verification Queue
router.get('/verifications', async (req, res) => {
  try {
    const pending = await prisma.hospital.findMany({
      where: { status: 'Pending' },
      include: {
        departments: true,
        users: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ pendingHospitals: pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load verification queue' });
  }
});

// Approve or Reject Hospital
router.post('/verifications/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: "approve" | "reject"

    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const newStatus = action === 'approve' ? 'Verified' : 'Suspended';

    const updated = await prisma.hospital.update({
      where: { id },
      data: {
        status: newStatus,
        lastUpdated: new Date(),
        lastUpdatedBy: req.user.name,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'VERIFICATION',
        entityType: 'Hospital',
        entityId: id,
        performedByName: req.user.name,
        details: `${action === 'approve' ? 'Approved' : 'Rejected'} hospital ${hospital.name}. Note: ${reason || 'Criteria met'}`,
        beforeValues: JSON.stringify({ status: hospital.status }),
        afterValues: JSON.stringify({ status: newStatus, reason }),
      },
    });

    broadcastHospitalUpdate(id, { status: newStatus });

    res.json({
      success: true,
      hospital: updated,
      message: `Hospital ${action === 'approve' ? 'approved and made live' : 'rejected'}.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process verification decision' });
  }
});

// Hospital Management (All Hospitals)
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        _count: { select: { doctors: true, departments: true, users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = hospitals.map((h) => ({
      ...h,
      freshness: calculateFreshness(h.lastUpdated),
    }));

    res.json({ hospitals: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load hospitals list' });
  }
});

// Update Hospital Status or Plan
router.patch('/hospitals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, plan } = req.body;

    const existing = await prisma.hospital.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Hospital not found' });

    const updateData = {};
    if (status) updateData.status = status;
    if (plan) updateData.plan = plan;

    const updated = await prisma.hospital.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: plan ? 'PLAN_CHANGE' : 'STATUS_UPDATE',
        entityType: 'Hospital',
        entityId: id,
        performedByName: req.user.name,
        details: `Hospital ${existing.name} modified: ${status ? `status=${status} ` : ''}${plan ? `plan=${plan}` : ''}`,
        beforeValues: JSON.stringify({ status: existing.status, plan: existing.plan }),
        afterValues: JSON.stringify(updateData),
      },
    });

    broadcastHospitalUpdate(id, updateData);

    res.json({
      success: true,
      hospital: updated,
      message: 'Hospital updated successfully',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hospital' });
  }
});

// Data Quality Monitor (Staleness Table)
router.get('/data-quality', async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { status: 'Verified' },
      select: {
        id: true,
        name: true,
        phone: true,
        lastUpdated: true,
        lastUpdatedBy: true,
        dataSource: true,
        emergencyStatus: true,
      },
    });

    const evaluated = hospitals
      .map((h) => {
        const freshness = calculateFreshness(h.lastUpdated);
        return {
          ...h,
          freshness,
          isStale: freshness.isOutdated, // > 4 hours
        };
      })
      .sort((a, b) => b.freshness.minsAgo - a.freshness.minsAgo);

    const reminderLogs = await prisma.reminderLog.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
    });

    res.json({
      hospitals: evaluated,
      totalVerified: evaluated.length,
      staleCount: evaluated.filter((h) => h.isStale).length,
      recentReminders: reminderLogs,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data quality monitor' });
  }
});

// Send Staleness Reminder
router.post('/data-quality/:id/remind', async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const log = await prisma.reminderLog.create({
      data: {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        sentBy: req.user.name,
        status: 'Sent',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'STALENESS_REMINDER',
        entityType: 'Hospital',
        entityId: id,
        performedByName: req.user.name,
        details: `Operational reminder sent to ${hospital.name} to update capacity data.`,
      },
    });

    res.json({
      success: true,
      message: `Freshness reminder notification dispatched to ${hospital.name} operational desk.`,
      log,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit logs' });
  }
});

// Platform Content
router.get('/content', async (req, res) => {
  try {
    let content = await prisma.platformContent.findUnique({
      where: { id: 'default' },
    });
    if (!content) {
      content = await prisma.platformContent.create({
        data: {
          id: 'default',
          headline: 'Know before you go.',
          subheadline: "Don't just find a hospital. Know its current capacity before you go.",
          safetyDisclaimer: 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
        },
      });
    }
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load platform content' });
  }
});

router.put('/content', async (req, res) => {
  try {
    const { headline, subheadline, safetyDisclaimer } = req.body;
    const existing = await prisma.platformContent.findUnique({ where: { id: 'default' } });

    const updated = await prisma.platformContent.upsert({
      where: { id: 'default' },
      update: {
        headline: headline || undefined,
        subheadline: subheadline || undefined,
        safetyDisclaimer: safetyDisclaimer || undefined,
      },
      create: {
        id: 'default',
        headline: headline || 'Know before you go.',
        subheadline: subheadline || "Don't just find a hospital. Know its current capacity before you go.",
        safetyDisclaimer: safetyDisclaimer || 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CONTENT_UPDATE',
        entityType: 'PlatformContent',
        entityId: 'default',
        performedByName: req.user.name,
        details: 'Admin updated public platform text and safety disclaimers',
        beforeValues: JSON.stringify(existing),
        afterValues: JSON.stringify(updated),
      },
    });

    res.json({ content: updated, message: 'Platform content updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update platform content' });
  }
});

// Reset Demo Data
router.post('/reset-demo', async (req, res) => {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Demo data has been reset to its pristine initial state!',
    });
  } catch (err) {
    console.error('Reset demo error:', err);
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

export default router;
