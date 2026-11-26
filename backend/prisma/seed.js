import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Clearing existing data...');
  await prisma.savedHospital.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.departmentQueue.deleteMany();
  await prisma.diagnosticQueue.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.reminderLog.deleteMany();
  await prisma.platformContent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  console.log('Seeding Platform Content...');
  await prisma.platformContent.create({
    data: {
      id: 'default',
      headline: 'Know before you go.',
      subheadline: "Don't just find a hospital. Know its current capacity before you go.",
      safetyDisclaimer: 'For emergencies, follow appropriate emergency medical guidance and do not rely solely on app availability information.',
    },
  });

  const now = Date.now();
  const minutesAgo = (mins) => new Date(now - mins * 60 * 1000);
  const hoursAgo = (hrs) => new Date(now - hrs * 3600 * 1000);

  console.log('Seeding Hospitals...');
  const hospitalData = [
    {
      id: 'hosp-1-heritage',
      name: 'Heritage Institute of Medical Sciences',
      regNumber: 'UP-MED-2018-8421',
      address: 'NH-2, Bhadwar, Mirzamurad Road',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221311',
      phone: '+91 542 263 5200',
      website: 'https://hims.demo.in',
      latitude: 25.2638,
      longitude: 82.8833,
      status: 'Verified',
      plan: 'Professional',
      emergencyStatus: 'Normal',
      generalBedsAvailable: 142,
      generalBedsTotal: 180,
      icuBedsAvailable: 14,
      icuBedsTotal: 20,
      emergencyBedsAvailable: 8,
      emergencyBedsTotal: 12,
      lastUpdated: minutesAgo(8), // Live (<15m)
      lastUpdatedBy: 'Dr. S. K. Verma (Chief Medical Officer)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-2-apex',
      name: 'Apex Super Speciality Hospital',
      regNumber: 'UP-MED-2019-9132',
      address: 'DLW Hydel Road, Kakarmatta',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221004',
      phone: '+91 542 231 6688',
      website: 'https://apexvns.demo.in',
      latitude: 25.2891,
      longitude: 82.9647,
      status: 'Verified',
      plan: 'Professional',
      emergencyStatus: 'Busy',
      generalBedsAvailable: 86,
      generalBedsTotal: 120,
      icuBedsAvailable: 6,
      icuBedsTotal: 18,
      emergencyBedsAvailable: 3,
      emergencyBedsTotal: 10,
      lastUpdated: minutesAgo(12), // Live (<15m)
      lastUpdatedBy: 'Rajeev Pandey (Senior Ward Incharge)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-3-shubham',
      name: 'Shubham Hospital & Research Centre',
      regNumber: 'UP-MED-2016-5214',
      address: 'S-8/108-A, Khajuri, Maqbool Alam Road',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221002',
      phone: '+91 542 250 8822',
      website: 'https://shubhamhospital.demo.in',
      latitude: 25.3340,
      longitude: 82.9812,
      status: 'Verified',
      plan: 'Starter',
      emergencyStatus: 'Normal',
      generalBedsAvailable: 45,
      generalBedsTotal: 60,
      icuBedsAvailable: 5,
      icuBedsTotal: 8,
      emergencyBedsAvailable: 4,
      emergencyBedsTotal: 6,
      lastUpdated: minutesAgo(35), // Recent (<60m)
      lastUpdatedBy: 'Priya Sharma (Staff Registrar)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-4-popular',
      name: 'Popular Hospital & Heart Centre',
      regNumber: 'UP-MED-2017-6743',
      address: 'N-10/60, Kakarmatta Chauraha',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221004',
      phone: '+91 542 231 7700',
      website: 'https://popularhospital.demo.in',
      latitude: 25.2982,
      longitude: 82.9734,
      status: 'Verified',
      plan: 'Professional',
      emergencyStatus: 'Busy',
      generalBedsAvailable: 68,
      generalBedsTotal: 90,
      icuBedsAvailable: 4,
      icuBedsTotal: 12,
      emergencyBedsAvailable: 2,
      emergencyBedsTotal: 8,
      lastUpdated: minutesAgo(48), // Recent (<60m)
      lastUpdatedBy: 'Amit Mishra (Duty Coordinator)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-5-galaxy',
      name: 'Galaxy Hospital',
      regNumber: 'UP-MED-2015-4421',
      address: 'Mahmoorganj Main Road, Near Shivaji Park',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221010',
      phone: '+91 542 222 1911',
      website: 'https://galaxyhospital.demo.in',
      latitude: 25.3125,
      longitude: 82.9820,
      status: 'Verified',
      plan: 'Starter',
      emergencyStatus: 'Limited',
      generalBedsAvailable: 22,
      generalBedsTotal: 50,
      icuBedsAvailable: 1,
      icuBedsTotal: 10,
      emergencyBedsAvailable: 1,
      emergencyBedsTotal: 6,
      lastUpdated: hoursAgo(2.25), // Aging (<4h)
      lastUpdatedBy: 'Sunita Rai (Nursing Desk)',
      dataSource: 'Staff update',
    },
    {
      id: 'hosp-6-surya',
      name: 'Surya Super Speciality Hospital',
      regNumber: 'UP-MED-2020-1094',
      address: 'C-21/1-C, Vidyapeeth Road, Sigra',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221002',
      phone: '+91 542 222 7500',
      website: 'https://suryahospital.demo.in',
      latitude: 25.3211,
      longitude: 82.9912,
      status: 'Verified',
      plan: 'Professional',
      emergencyStatus: 'Normal',
      generalBedsAvailable: 74,
      generalBedsTotal: 100,
      icuBedsAvailable: 8,
      icuBedsTotal: 15,
      emergencyBedsAvailable: 5,
      emergencyBedsTotal: 10,
      lastUpdated: hoursAgo(3.6), // Aging (<4h)
      lastUpdatedBy: 'Vikas Singh (Triage Supervisor)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-7-triveni',
      name: 'Triveni Hospital & Trauma Centre',
      regNumber: 'UP-MED-2018-7822',
      address: 'Station Road, Near Railway Colony',
      city: 'Bhadohi',
      state: 'Uttar Pradesh',
      pincode: '221401',
      phone: '+91 5414 225 311',
      website: 'https://trivenihospital.demo.in',
      latitude: 25.3942,
      longitude: 82.5694,
      status: 'Verified',
      plan: 'Starter',
      emergencyStatus: 'Busy',
      generalBedsAvailable: 18,
      generalBedsTotal: 40,
      icuBedsAvailable: 2,
      icuBedsTotal: 6,
      emergencyBedsAvailable: 2,
      emergencyBedsTotal: 5,
      lastUpdated: hoursAgo(5.3), // Outdated (>4h)
      lastUpdatedBy: 'Manoj Tiwari (Desk Clerk)',
      dataSource: 'Hospital dashboard',
    },
    {
      id: 'hosp-8-citylife',
      name: 'City Life Care Hospital',
      regNumber: 'UP-MED-2021-3312',
      address: 'Bhadohi Bypass Road, Near Toll Plaza',
      city: 'Bhadohi',
      state: 'Uttar Pradesh',
      pincode: '221409',
      phone: '+91 5414 228 900',
      website: 'https://citylifecare.demo.in',
      latitude: 25.3450,
      longitude: 82.8520,
      status: 'Verified',
      plan: 'Professional',
      emergencyStatus: 'Limited',
      generalBedsAvailable: 10,
      generalBedsTotal: 45,
      icuBedsAvailable: 0,
      icuBedsTotal: 8,
      emergencyBedsAvailable: 0,
      emergencyBedsTotal: 6,
      lastUpdated: hoursAgo(7.2), // Outdated (>4h)
      lastUpdatedBy: 'Anil Gupta (Admin Staff)',
      dataSource: 'Staff update',
    },
    {
      id: 'hosp-9-kashimedanta',
      name: 'Kashi Medanta Multi Speciality Hospital',
      regNumber: 'UP-MED-2024-9988',
      address: 'Airport Road, Shivpur Bypass',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221003',
      phone: '+91 542 277 8100',
      website: 'https://kashimedanta.demo.in',
      latitude: 25.3615,
      longitude: 82.9640,
      status: 'Pending', // Pending verification for admin demo
      plan: 'Professional',
      emergencyStatus: 'Normal',
      generalBedsAvailable: 50,
      generalBedsTotal: 80,
      icuBedsAvailable: 10,
      icuBedsTotal: 16,
      emergencyBedsAvailable: 6,
      emergencyBedsTotal: 8,
      lastUpdated: minutesAgo(20),
      lastUpdatedBy: 'Dr. R. C. Mathur (Director)',
      dataSource: 'New Registration',
    },
    {
      id: 'hosp-10-ayushmaan',
      name: 'Ayushmaan Hospital & Heart Care',
      regNumber: 'UP-MED-2019-4112',
      address: 'Gyanpur Road, Chauri Crossing',
      city: 'Bhadohi',
      state: 'Uttar Pradesh',
      pincode: '221401',
      phone: '+91 5414 221 445',
      website: 'https://ayushmaanhosp.demo.in',
      latitude: 25.3850,
      longitude: 82.5800,
      status: 'Suspended', // Suspended for admin demo
      plan: 'Starter',
      emergencyStatus: 'Busy',
      generalBedsAvailable: 12,
      generalBedsTotal: 30,
      icuBedsAvailable: 1,
      icuBedsTotal: 4,
      emergencyBedsAvailable: 1,
      emergencyBedsTotal: 4,
      lastUpdated: hoursAgo(26),
      lastUpdatedBy: 'Hospital Admin',
      dataSource: 'Hospital dashboard',
    },
  ];

  for (const h of hospitalData) {
    await prisma.hospital.create({ data: h });
  }

  console.log('Seeding Department Queues & Diagnostic Queues & Doctors...');
  const deptTemplates = [
    { departmentName: 'Cardiology', waitingCount: 14, estimatedWaitMins: 35 },
    { departmentName: 'Orthopedics', waitingCount: 9, estimatedWaitMins: 25 },
    { departmentName: 'Neurology', waitingCount: 6, estimatedWaitMins: 45 },
    { departmentName: 'General Medicine', waitingCount: 22, estimatedWaitMins: 20 },
    { departmentName: 'Paediatrics', waitingCount: 8, estimatedWaitMins: 15 },
    { departmentName: 'Gynaecology', waitingCount: 11, estimatedWaitMins: 30 },
    { departmentName: 'Emergency', waitingCount: 5, estimatedWaitMins: 10 },
  ];

  const diagTemplates = [
    { testName: 'MRI', waitingCount: 8, estimatedWaitMins: 60 },
    { testName: 'CT Scan', waitingCount: 11, estimatedWaitMins: 40 },
    { testName: 'Blood Test', waitingCount: 16, estimatedWaitMins: 15 },
    { testName: 'X-Ray', waitingCount: 12, estimatedWaitMins: 20 },
  ];

  const doctorTemplates = [
    { name: 'Dr. Alok Chandra', specialty: 'Cardiology', status: 'On duty', roomNumber: 'OPD-102', nextAvailable: 'In 15 mins' },
    { name: 'Dr. Suniti Mukherjee', specialty: 'Neurology', status: 'On duty', roomNumber: 'OPD-205', nextAvailable: 'In 30 mins' },
    { name: 'Dr. Rajiv Anand', specialty: 'Orthopedics', status: 'On duty', roomNumber: 'OPD-114', nextAvailable: 'In 20 mins' },
    { name: 'Dr. Neha Srivastava', specialty: 'Paediatrics', status: 'On leave', roomNumber: 'OPD-108', nextAvailable: 'Tomorrow 9 AM' },
    { name: 'Dr. Farooq Khan', specialty: 'General Medicine', status: 'On duty', roomNumber: 'OPD-101', nextAvailable: 'Immediate' },
    { name: 'Dr. Shweta Keshari', specialty: 'Gynaecology', status: 'Off duty', roomNumber: 'OPD-210', nextAvailable: 'Today 4 PM' },
  ];

  for (let i = 0; i < hospitalData.length; i++) {
    const hosp = hospitalData[i];
    // Vary counts slightly per hospital
    for (const d of deptTemplates) {
      const waitVariation = (i * 3) % 15;
      const countVariation = (i * 2) % 10;
      await prisma.departmentQueue.create({
        data: {
          hospitalId: hosp.id,
          departmentName: d.departmentName,
          waitingCount: Math.max(2, d.waitingCount + countVariation - 4),
          estimatedWaitMins: Math.max(5, d.estimatedWaitMins + waitVariation - 10),
          lastUpdated: hosp.lastUpdated,
        },
      });
    }

    for (const diag of diagTemplates) {
      const waitVar = (i * 5) % 25;
      const countVar = (i * 3) % 8;
      await prisma.diagnosticQueue.create({
        data: {
          hospitalId: hosp.id,
          testName: diag.testName,
          waitingCount: Math.max(1, diag.waitingCount + countVar - 3),
          estimatedWaitMins: Math.max(10, diag.estimatedWaitMins + waitVar - 15),
          lastUpdated: hosp.lastUpdated,
        },
      });
    }

    // Assign doctors
    for (const doc of doctorTemplates) {
      await prisma.doctor.create({
        data: {
          hospitalId: hosp.id,
          name: doc.name,
          specialty: doc.specialty,
          status: doc.status,
          roomNumber: doc.roomNumber,
          nextAvailable: doc.nextAvailable,
        },
      });
    }
  }

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const hospitalPassword = await bcrypt.hash('Hospital@123', salt);
  const patientPassword = await bcrypt.hash('Patient@123', salt);

  // Admin user
  await prisma.user.create({
    data: {
      email: 'admin@careflow.demo',
      passwordHash: adminPassword,
      name: 'Aditi Sharma (Admin Ops)',
      role: 'admin',
    },
  });

  // Hospital Staff 1 (Heritage Institute)
  await prisma.user.create({
    data: {
      email: 'hospital1@careflow.demo',
      passwordHash: hospitalPassword,
      name: 'Dr. S. K. Verma',
      role: 'hospital',
      hospitalId: 'hosp-1-heritage',
      hospitalRole: 'Editor',
    },
  });

  // Hospital Staff 2 (Apex Super Speciality)
  await prisma.user.create({
    data: {
      email: 'hospital2@careflow.demo',
      passwordHash: hospitalPassword,
      name: 'Rajeev Pandey',
      role: 'hospital',
      hospitalId: 'hosp-2-apex',
      hospitalRole: 'Editor',
    },
  });

  // Patient User
  const patient = await prisma.user.create({
    data: {
      email: 'patient@careflow.demo',
      passwordHash: patientPassword,
      name: 'Rohit K. Kashyap',
      role: 'patient',
    },
  });

  // Saved hospitals for demo patient
  await prisma.savedHospital.create({
    data: {
      userId: patient.id,
      hospitalId: 'hosp-1-heritage',
    },
  });
  await prisma.savedHospital.create({
    data: {
      userId: patient.id,
      hospitalId: 'hosp-2-apex',
    },
  });

  console.log('Seeding Audit Logs...');
  const auditEntries = [
    {
      action: 'STATUS_UPDATE',
      entityType: 'Hospital',
      entityId: 'hosp-1-heritage',
      performedByName: 'Dr. S. K. Verma',
      details: 'Updated OPD queue and emergency status to Normal',
      beforeValues: JSON.stringify({ emergencyStatus: 'Busy', generalBedsAvailable: 138 }),
      afterValues: JSON.stringify({ emergencyStatus: 'Normal', generalBedsAvailable: 142 }),
      createdAt: minutesAgo(8),
    },
    {
      action: 'STATUS_UPDATE',
      entityType: 'Hospital',
      entityId: 'hosp-2-apex',
      performedByName: 'Rajeev Pandey',
      details: 'Updated ICU beds and MRI queue time',
      beforeValues: JSON.stringify({ icuBedsAvailable: 8, emergencyStatus: 'Normal' }),
      afterValues: JSON.stringify({ icuBedsAvailable: 6, emergencyStatus: 'Busy' }),
      createdAt: minutesAgo(12),
    },
    {
      action: 'VERIFICATION',
      entityType: 'Verification',
      entityId: 'hosp-6-surya',
      performedByName: 'Aditi Sharma (Admin Ops)',
      details: 'Approved hospital registration UP-MED-2020-1094',
      beforeValues: JSON.stringify({ status: 'Pending' }),
      afterValues: JSON.stringify({ status: 'Verified' }),
      createdAt: hoursAgo(12),
    },
    {
      action: 'PLAN_CHANGE',
      entityType: 'Subscription',
      entityId: 'hosp-4-popular',
      performedByName: 'Aditi Sharma (Admin Ops)',
      details: 'Plan upgraded from Starter to Professional',
      beforeValues: JSON.stringify({ plan: 'Starter' }),
      afterValues: JSON.stringify({ plan: 'Professional' }),
      createdAt: hoursAgo(24),
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }

  console.log('Seeding Reminder Logs...');
  await prisma.reminderLog.create({
    data: {
      hospitalId: 'hosp-7-triveni',
      hospitalName: 'Triveni Hospital & Trauma Centre',
      sentAt: hoursAgo(1),
      sentBy: 'System Auto-Trigger',
      status: 'Sent',
    },
  });

  console.log('Database seeded successfully!');
}

// Run directly if invoked as CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
