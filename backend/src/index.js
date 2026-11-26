import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import prisma from './prisma.js';
import { initSocket } from './socket.js';
import { seedDatabase } from '../prisma/seed.js';

import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import hospitalPortalRoutes from './routes/hospitalPortal.js';
import adminPortalRoutes from './routes/adminPortal.js';
import patientPortalRoutes from './routes/patientPortal.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/hospital', hospitalPortalRoutes);
app.use('/api/admin', adminPortalRoutes);
app.use('/api/patient', patientPortalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CareFlow API & Real-time Server',
    tagline: 'Know before you go',
    timestamp: new Date().toISOString(),
  });
});

// Auto-seed database if empty on server start
async function checkAndAutoSeed() {
  try {
    const hospitalCount = await prisma.hospital.count();
    if (hospitalCount === 0) {
      console.log('Database is empty. Running initial demo seed...');
      await seedDatabase();
    } else {
      console.log(`Database ready with ${hospitalCount} hospitals.`);
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err);
  }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`===============================================`);
  console.log(` CareFlow API & Socket Server running on port ${PORT}`);
  console.log(` "Don't just find a hospital. Know its current capacity before you go."`);
  console.log(`===============================================`);
  await checkAndAutoSeed();
});
