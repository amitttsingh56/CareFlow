import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

export const calculateFreshness = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 15) {
    return { level: 'Live', badge: 'Live (<15m)', color: 'emerald', isOutdated: false, minsAgo: diffMins };
  } else if (diffMins < 60) {
    return { level: 'Recent', badge: 'Recent (<60m)', color: 'blue', isOutdated: false, minsAgo: diffMins };
  } else if (diffMins < 240) {
    return { level: 'Aging', badge: 'Aging (<4h)', color: 'amber', isOutdated: false, minsAgo: diffMins };
  } else {
    return { level: 'Outdated', badge: '⚠ Data may be outdated', color: 'rose', isOutdated: true, minsAgo: diffMins };
  }
};

// Calculate distance using Haversine formula (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Public Hospitals List & Search
router.get('/', async (req, res) => {
  try {
    const { search, specialty, test, city, status, freshness, sortBy, lat, lng } = req.query;

    const userLat = lat ? parseFloat(lat) : 25.3176; // Default Varanasi center
    const userLng = lng ? parseFloat(lng) : 82.9739;

    const where = {
      status: 'Verified', // ONLY verified hospitals shown to patients
    };

    if (city && city !== 'all') {
      where.city = city;
    }

    if (status && status !== 'all') {
      where.emergencyStatus = status;
    }

    let hospitals = await prisma.hospital.findMany({
      where,
      include: {
        departments: true,
        diagnostics: true,
        doctors: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    // Map computed fields
    let formatted = hospitals.map((h) => {
      const freshnessData = calculateFreshness(h.lastUpdated);
      const distance = calculateDistance(userLat, userLng, h.latitude, h.longitude);

      // Average estimated wait across all OPD departments
      const totalDeptWait = h.departments.reduce((acc, d) => acc + d.estimatedWaitMins, 0);
      const avgDeptWait = h.departments.length > 0 ? Math.round(totalDeptWait / h.departments.length) : 20;

      // Check if specialty matched
      const matchedDept = specialty
        ? h.departments.find((d) => d.departmentName.toLowerCase() === specialty.toLowerCase())
        : null;

      // Check if test matched
      const matchedDiag = test
        ? h.diagnostics.find((d) => d.testName.toLowerCase() === test.toLowerCase())
        : null;

      const activeSpecialties = h.departments.map((d) => d.departmentName);
      const availableTests = h.diagnostics.map((d) => d.testName);

      return {
        ...h,
        freshness: freshnessData,
        distanceKm: distance,
        avgDeptWaitMins: avgDeptWait,
        matchedDeptWaitMins: matchedDept ? matchedDept.estimatedWaitMins : null,
        matchedDiagWaitMins: matchedDiag ? matchedDiag.estimatedWaitMins : null,
        specialties: activeSpecialties,
        tests: availableTests,
        totalDoctorsCount: h.doctors.length,
        onDutyDoctorsCount: h.doctors.filter((d) => d.status === 'On duty').length,
        isOutdated: freshnessData.isOutdated,
      };
    });

    // Text Search filter (hospital name, address, or specialty/test)
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.specialties.some((s) => s.toLowerCase().includes(q)) ||
          h.tests.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Specialty filter
    if (specialty && specialty !== 'all') {
      formatted = formatted.filter((h) =>
        h.specialties.some((s) => s.toLowerCase() === specialty.toLowerCase())
      );
    }

    // Diagnostic test filter
    if (test && test !== 'all') {
      formatted = formatted.filter((h) =>
        h.tests.some((t) => t.toLowerCase() === test.toLowerCase())
      );
    }

    // Freshness filter
    if (freshness && freshness !== 'all') {
      formatted = formatted.filter((h) => h.freshness.level.toLowerCase() === freshness.toLowerCase());
    }

    // Sorting
    if (sortBy === 'wait') {
      formatted.sort((a, b) => a.avgDeptWaitMins - b.avgDeptWaitMins);
    } else if (sortBy === 'distance') {
      formatted.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (sortBy === 'freshness') {
      formatted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return res.json({
      hospitals: formatted,
      total: formatted.length,
      safetyDisclaimer: 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
      isIllustrative: true,
    });
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Compare up to 3 hospitals
router.get('/compare', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'ids query parameter required' });
    }

    const idList = ids.split(',').filter(Boolean).slice(0, 3);
    const hospitals = await prisma.hospital.findMany({
      where: {
        id: { in: idList },
        status: 'Verified',
      },
      include: {
        departments: true,
        diagnostics: true,
        doctors: true,
      },
    });

    const formatted = hospitals.map((h) => {
      const freshnessData = calculateFreshness(h.lastUpdated);
      const totalWait = h.departments.reduce((acc, d) => acc + d.estimatedWaitMins, 0);
      const avgWait = h.departments.length > 0 ? Math.round(totalWait / h.departments.length) : 20;

      return {
        ...h,
        freshness: freshnessData,
        avgWaitMins: avgWait,
        onDutyDoctors: h.doctors.filter((d) => d.status === 'On duty').length,
        totalDoctors: h.doctors.length,
      };
    });

    res.json({ hospitals: formatted });
  } catch (err) {
    console.error('Error in compare:', err);
    res.status(500).json({ error: 'Failed to load comparison data' });
  }
});

// Public Platform Content
router.get('/content/platform', async (req, res) => {
  try {
    let content = await prisma.platformContent.findUnique({
      where: { id: 'default' },
    });
    if (!content) {
      content = {
        headline: 'Know before you go.',
        subheadline: "Don't just find a hospital. Know its current capacity before you go.",
        safetyDisclaimer: 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
      };
    }
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch platform content' });
  }
});

// Single Hospital Detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: {
          orderBy: { departmentName: 'asc' },
        },
        diagnostics: {
          orderBy: { testName: 'asc' },
        },
        doctors: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const freshnessData = calculateFreshness(hospital.lastUpdated);

    res.json({
      ...hospital,
      freshness: freshnessData,
      safetyNotice: 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
      wordingDisclaimer: 'All bed and queue metrics reflect reported availability and estimated waiting times. Subject to change without prior notice.',
      isIllustrative: true,
    });
  } catch (err) {
    console.error('Error fetching hospital detail:', err);
    res.status(500).json({ error: 'Failed to fetch hospital details' });
  }
});

export default router;
