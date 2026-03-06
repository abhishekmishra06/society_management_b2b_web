import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initMasterDB } from './models/masterSchema.js';
import { authMiddleware } from './middleware/auth.js';
import { societyContext, requireSociety } from './middleware/societyContext.js';
import { createCrudRouter } from './utils/crudFactory.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/auth/users.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import towersRoutes from './modules/towers/towers.routes.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','x-society-id'] }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('short'));
app.use(authMiddleware);
app.use(societyContext);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'society-management-backend', database: 'mysql', architecture: 'multi-tenant' }));

// ===== AUTH MODULE =====
app.use('/api/auth', authRoutes);

// ===== USER MODULE =====
app.use('/api/users', usersRoutes);
app.use('/api/user', usersRoutes);

// ===== ADMIN MODULE (Super Admin) =====
app.use('/api/admin', adminRoutes);

// ===== NOTIFICATION MODULE =====
app.use('/api/notifications', notificationRoutes);

// ===== SOCIETY-LEVEL MODULES (require x-society-id header) =====

// Dashboard stats
app.use('/api/dashboard/stats', requireSociety, dashboardRoutes);

// Towers
app.use('/api/towers', requireSociety, towersRoutes);

// Residents
app.use('/api/residents', requireSociety, createCrudRouter('residents',
  ['name','flatNumber','tower','phone','email','type','status','vehicleNumber','aadhaarNumber','moveInDate','emergencyContact'],
  ['name','flatNumber','tower','phone','email','type','status','vehicleNumber','aadhaarNumber','moveInDate','emergencyContact']
));

// Complaints
app.use('/api/complaints', requireSociety, createCrudRouter('complaints',
  ['title','description','category','status','priority','reportedBy','flatNumber','assignedTo'],
  ['title','description','category','status','priority','reportedBy','flatNumber','assignedTo']
));

// Notices
app.use('/api/notices', requireSociety, createCrudRouter('notices',
  ['title','description','category','priority','status','postedBy'],
  ['title','description','category','priority','status','postedBy']
));

// Visitors
app.use('/api/visitors', requireSociety, createCrudRouter('visitors',
  ['name','phone','purpose','flatNumber','tower','status','vehicleNumber','checkInTime','approvedBy'],
  ['name','phone','purpose','flatNumber','tower','status','vehicleNumber','checkInTime','checkOutTime','approvedBy']
));

// Parking
app.use('/api/parking', requireSociety, createCrudRouter('parking',
  ['slotNumber','type','status','vehicleNumber','vehicleType','flatNumber','ownerName'],
  ['slotNumber','type','status','vehicleNumber','vehicleType','flatNumber','ownerName'],
  'slotNumber'
));

// Staff
app.use('/api/staff', requireSociety, createCrudRouter('staff',
  ['name','role','phone','email','department','status','joinDate','salary','address'],
  ['name','role','phone','email','department','status','joinDate','salary','address']
));

// Vendors
app.use('/api/vendors', requireSociety, createCrudRouter('vendors',
  ['name','company','service','phone','email','status','address'],
  ['name','company','service','phone','email','status','address']
));

// Vendor Contracts
app.use('/api/vendor-contracts', requireSociety, createCrudRouter('vendor_contracts',
  ['vendorId','vendorName','title','startDate','endDate','amount','status','description'],
  ['vendorId','vendorName','title','startDate','endDate','amount','status','description']
));

// Vendor Payments
app.use('/api/vendor-payments', requireSociety, createCrudRouter('vendor_payments',
  ['vendorId','vendorName','amount','paymentDate','method','status','receiptNo','description'],
  ['vendorId','vendorName','amount','paymentDate','method','status','receiptNo','description']
));

// Billing
app.use('/api/billing', requireSociety, createCrudRouter('billing',
  ['flatNumber','tower','residentName','amount','type','month','year','dueDate','status'],
  ['flatNumber','tower','residentName','amount','type','month','year','dueDate','status','paidDate','paidAmount','paymentMethod','receiptNo']
));

// Billing Payments
app.use('/api/billing-payments', requireSociety, createCrudRouter('billing_payments',
  ['billingId','flatNumber','amount','method','transactionId','receiptNo','status'],
  ['billingId','flatNumber','amount','method','transactionId','receiptNo','status']
));

// Move Requests
app.use('/api/move-requests', requireSociety, createCrudRouter('move_requests',
  ['type','flatNumber','tower','residentName','phone','moveDate','status','reason'],
  ['type','flatNumber','tower','residentName','phone','moveDate','status','reason','approvedBy']
));

// Documents
app.use('/api/documents', requireSociety, createCrudRouter('documents',
  ['title','category','description','fileUrl','fileName','fileSize','uploadedBy','status'],
  ['title','category','description','fileUrl','fileName','status']
));

// Facilities
app.use('/api/facilities', requireSociety, createCrudRouter('facilities',
  ['name','type','capacity','status','description','location','timings','charges'],
  ['name','type','capacity','status','description','location','timings','charges']
));

// Facility Bookings
app.use('/api/facility-bookings', requireSociety, createCrudRouter('facility_bookings',
  ['facilityId','facilityName','bookedBy','flatNumber','bookingDate','startTime','endTime','purpose','status'],
  ['facilityId','facilityName','bookedBy','flatNumber','bookingDate','startTime','endTime','purpose','status']
));

// Assets
app.use('/api/assets', requireSociety, createCrudRouter('assets',
  ['name','category','condition','value','location','purchaseDate','warrantyExpiry','description'],
  ['name','category','condition','value','location','purchaseDate','warrantyExpiry','description']
));

// Gate Passes
app.use('/api/gate-passes', requireSociety, createCrudRouter('gate_passes',
  ['type','name','phone','flatNumber','purpose','vehicleNumber','status','validUntil','createdBy'],
  ['type','name','phone','flatNumber','purpose','vehicleNumber','status','validUntil']
));

// Emergencies
app.use('/api/emergencies', requireSociety, createCrudRouter('emergencies',
  ['type','description','reportedBy','flatNumber','status'],
  ['type','description','status','resolvedBy']
));

// Announcements
app.use('/api/announcements', requireSociety, createCrudRouter('announcements',
  ['title','description','category','priority','status','postedBy'],
  ['title','description','category','priority','status','postedBy']
));

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: err.message });
});

// Start server
async function start() {
  try {
    await initMasterDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Society Management Backend running on port ${PORT}`);
      console.log(`   Database: MySQL (Multi-tenant)`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
