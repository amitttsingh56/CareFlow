import express from 'express';
import prisma from '../prisma.js';
import { verifyToken } from '../middleware/auth.js';
import { calculateFreshness } from './hospitals.js';

const router = express.Router();

router.use(verifyToken);

// Get saved hospitals
router.get('/saved', async (req, res) => {
  try {
    const saved = await prisma.savedHospital.findMany({
      where: { userId: req.user.id },
      include: {
        hospital: {
          include: {
            departments: true,
            diagnostics: true,
            doctors: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = saved.map((s) => {
      const h = s.hospital;
      const freshness = calculateFreshness(h.lastUpdated);
      const totalWait = h.departments.reduce((acc, d) => acc + d.estimatedWaitMins, 0);
      const avgWait = h.departments.length > 0 ? Math.round(totalWait / h.departments.length) : 20;

      return {
        savedId: s.id,
        savedAt: s.createdAt,
        ...h,
        freshness,
        avgDeptWaitMins: avgWait,
        specialties: h.departments.map((d) => d.departmentName),
      };
    });

    res.json({ savedHospitals: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved hospitals' });
  }
});

// Toggle saved hospital
router.post('/saved/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const existing = await prisma.savedHospital.findUnique({
      where: {
        userId_hospitalId: {
          userId: req.user.id,
          hospitalId,
        },
      },
    });

    if (existing) {
      await prisma.savedHospital.delete({ where: { id: existing.id } });
      return res.json({ saved: false, message: 'Hospital removed from saved list' });
    } else {
      await prisma.savedHospital.create({
        data: {
          userId: req.user.id,
          hospitalId,
        },
      });
      return res.json({ saved: true, message: 'Hospital saved to your list' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update saved status' });
  }
});

// Patient Profile
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        savedHospitals: {
          include: { hospital: true },
        },
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedCount: user.savedHospitals.length,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });

    res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
