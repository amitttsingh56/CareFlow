import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// 1-Click Demo Login
router.post('/demo-login', async (req, res) => {
  try {
    const { roleKey } = req.body;
    let email = 'patient@careflow.demo';

    if (roleKey === 'admin') email = 'admin@careflow.demo';
    else if (roleKey === 'hospital' || roleKey === 'hospital1') email = 'hospital1@careflow.demo';
    else if (roleKey === 'hospital2') email = 'hospital2@careflow.demo';
    else if (roleKey === 'patient') email = 'patient@careflow.demo';

    const user = await prisma.user.findUnique({
      where: { email },
      include: { hospital: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed script.' });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalRole: user.hospitalRole,
        hospital: user.hospital,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Failed to authenticate demo user' });
  }
});

// Standard Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { hospital: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalRole: user.hospitalRole,
        hospital: user.hospital,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Registration (Patient or Hospital)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, hospitalDetails } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (role === 'hospital') {
      if (!hospitalDetails?.name || !hospitalDetails?.regNumber) {
        return res.status(400).json({ error: 'Hospital name and registration number are required' });
      }

      // Create hospital in Pending verification state
      const hospital = await prisma.hospital.create({
        data: {
          name: hospitalDetails.name,
          regNumber: hospitalDetails.regNumber,
          address: hospitalDetails.address || 'Address provided at registration',
          city: hospitalDetails.city || 'Varanasi',
          state: hospitalDetails.state || 'Uttar Pradesh',
          pincode: hospitalDetails.pincode || '221001',
          phone: hospitalDetails.phone || '+91 542 000 0000',
          website: hospitalDetails.website || 'https://careflow.demo',
          latitude: hospitalDetails.latitude ? parseFloat(hospitalDetails.latitude) : 25.3176,
          longitude: hospitalDetails.longitude ? parseFloat(hospitalDetails.longitude) : 82.9739,
          status: 'Pending', // pending admin verification!
          plan: hospitalDetails.plan || 'Starter',
          emergencyStatus: 'Normal',
          generalBedsAvailable: 20,
          generalBedsTotal: 40,
          icuBedsAvailable: 4,
          icuBedsTotal: 8,
          emergencyBedsAvailable: 3,
          emergencyBedsTotal: 6,
          lastUpdatedBy: name,
          dataSource: 'Registration Portal',
        },
      });

      // Default departments
      const defaultDepts = ['Cardiology', 'Emergency', 'General Medicine', 'Orthopedics', 'Paediatrics'];
      for (const dept of defaultDepts) {
        await prisma.departmentQueue.create({
          data: {
            hospitalId: hospital.id,
            departmentName: dept,
            waitingCount: 5,
            estimatedWaitMins: 20,
          },
        });
      }

      // Default diagnostics
      const defaultDiags = ['Blood Test', 'X-Ray', 'CT Scan'];
      for (const diag of defaultDiags) {
        await prisma.diagnosticQueue.create({
          data: {
            hospitalId: hospital.id,
            testName: diag,
            waitingCount: 3,
            estimatedWaitMins: 25,
          },
        });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'hospital',
          hospitalRole: 'Editor',
          hospitalId: hospital.id,
        },
        include: { hospital: true },
      });

      // Log verification event in audit
      await prisma.auditLog.create({
        data: {
          action: 'REGISTRATION',
          entityType: 'Hospital',
          entityId: hospital.id,
          performedByName: name,
          details: `New hospital registration for ${hospital.name} (Pending verification)`,
          afterValues: JSON.stringify({ status: 'Pending', plan: hospital.plan }),
        },
      });

      const token = generateToken(user.id, user.role);
      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hospitalRole: user.hospitalRole,
          hospital: user.hospital,
        },
      });
    }

    // Default: Patient registration
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'patient',
      },
    });

    const token = generateToken(user.id, user.role);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register account' });
  }
});

// Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      hospitalRole: req.user.hospitalRole,
      hospital: req.user.hospital,
    },
  });
});

export default router;
