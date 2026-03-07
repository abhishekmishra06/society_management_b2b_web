import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { initMasterDB } from './models/masterSchema.js';
import { authMiddleware } from './middleware/auth.js';
import { societyContext, requireSociety } from './middleware/societyContext.js';
import { getSocietyPool } from './config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateQuery } from './utils/helpers.js';
import { setupWebSocket } from './modules/websocket/socket.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/auth/users.routes.js';
import adminRoutes from './modules/admin/index.js';
import userAppRoutes from './modules/userApp/index.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import towersRoutes from './modules/towers/towers.routes.js';
import residentsRoutes from './modules/residents/residents.routes.js';
import complaintsRoutes from './modules/complaints/complaints.routes.js';
import noticesRoutes from './modules/notices/notices.routes.js';
import visitorsRoutes from './modules/visitors/visitors.routes.js';
import parkingRoutes from './modules/parking/parking.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import vendorsRoutes from './modules/vendors/vendors.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import facilitiesRoutes from './modules/facilities/facilities.routes.js';
import assetsRoutes from './modules/assets/assets.routes.js';
import gatePassesRoutes from './modules/gate-passes/gatePasses.routes.js';
import emergenciesRoutes from './modules/emergencies/emergencies.routes.js';
import announcementsRoutes from './modules/announcements/announcements.routes.js';
import documentsRoutes from './modules/documents/documents.routes.js';
import moveRequestsRoutes from './modules/move-requests/moveRequests.routes.js';

const app = express();
<<<<<<< HEAD
const PORT = process.env.BACKEND_PORT || 5001;
=======
const httpServer = createServer(app);
const PORT = process.env.BACKEND_PORT || 5000;
>>>>>>> 34869be (auto-commit for 32274956-360b-4f44-bd83-658489297704)

// Setup WebSocket
const io = setupWebSocket(httpServer);
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-society-id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('short'));
app.use(authMiddleware);
app.use(societyContext);

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'society-management-backend',
  database: 'mysql',
  architecture: 'multi-tenant',
  websocket: true,
}));

// ===== AUTH MODULE =====
app.use('/api/auth', authRoutes);

// ===== LEGACY USER ROUTES (for backward compat) =====
app.use('/api/users', usersRoutes);
app.use('/api/user', userAppRoutes);

// ===== ADMIN MODULE (Super Admin) - Split into individual files =====
app.use('/api/admin', adminRoutes);

// ===== NOTIFICATION MODULE =====
app.use('/api/notifications', notificationRoutes);

// ===== SOCIETY-LEVEL MODULES (require x-society-id header) =====

// Dashboard stats
app.use('/api/dashboard/stats', requireSociety, dashboardRoutes);

// Towers & Flats
app.use('/api/towers', requireSociety, towersRoutes);

// Flats - separate route for society-level flat management
app.get('/api/flats', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM flats WHERE 1=1'; const p = [];
    if (req.query.towerId) { q += ' AND towerId=?'; p.push(req.query.towerId); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    if (req.query.search) {
      q += ' AND (flatNumber LIKE ? OR ownerName LIKE ? OR towerName LIKE ?)';
      p.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }
    q += ' ORDER BY towerName,flatNumber';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/flats/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM flats WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/flats/:id/occupancy', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [flat] = await pool.execute('SELECT * FROM flats WHERE id=?', [req.params.id]);
    if (!flat.length) return res.status(404).json({ error: 'Not found' });
    const [residents] = await pool.execute('SELECT * FROM residents WHERE flatNumber=? AND tower=?',
      [flat[0].flatNumber, flat[0].towerName]);
    res.json({ ...flat[0], residents });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/flats', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO flats (id,towerId,towerName,flatNumber,floor,type,area,ownerName,ownerPhone,ownerEmail,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.towerId||null, b.towerName||'', b.flatNumber||'', Number(b.floor)||0, b.type||'2BHK', b.area||'', b.ownerName||'', b.ownerPhone||'', b.ownerEmail||'', b.status||'vacant']);
    const [rows] = await pool.execute('SELECT * FROM flats WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/flats/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['towerId','towerName','flatNumber','floor','type','area','ownerName','ownerPhone','ownerEmail','status']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE flats SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/flats/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM flats WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Residents
app.use('/api/residents', requireSociety, residentsRoutes);

// Owners (filtered residents)
app.get('/api/owners', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM residents WHERE type="owner"'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR flatNumber LIKE ? OR phone LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/owners/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=? AND type="owner"', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/owners', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO residents (id,name,flatNumber,tower,phone,email,type,status,vehicleNumber,aadhaarNumber,moveInDate,emergencyContact) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.flatNumber||'', b.tower||'', b.phone||'', b.email||'', 'owner', b.status||'active', b.vehicleNumber||'', b.aadhaarNumber||'', b.moveInDate||null, b.emergencyContact||'']
    );
    if (b.flatNumber) {
      await pool.execute('UPDATE flats SET status="occupied", ownerName=?, ownerPhone=?, ownerEmail=? WHERE flatNumber=? AND towerName=?',
        [b.name||'', b.phone||'', b.email||'', b.flatNumber, b.tower||'']).catch(() => {});
    }
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/api/owners/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','flatNumber','tower','phone','email','status','vehicleNumber','aadhaarNumber','moveInDate','emergencyContact']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE residents SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Tenants (filtered residents)
app.get('/api/tenants', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM residents WHERE type="tenant"'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR flatNumber LIKE ? OR phone LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/tenants/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=? AND type="tenant"', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/tenants', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO residents (id,name,flatNumber,tower,phone,email,type,status,vehicleNumber,aadhaarNumber,moveInDate,emergencyContact) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.flatNumber||'', b.tower||'', b.phone||'', b.email||'', 'tenant', b.status||'active', b.vehicleNumber||'', b.aadhaarNumber||'', b.moveInDate||null, b.emergencyContact||'']
    );
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/api/tenants/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','flatNumber','tower','phone','email','status','vehicleNumber','aadhaarNumber','moveInDate','emergencyContact']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE residents SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Vehicles
app.get('/api/vehicles', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM parking WHERE vehicleNumber IS NOT NULL AND vehicleNumber != ""'; const p = [];
    if (req.query.search) { q += ' AND (vehicleNumber LIKE ? OR ownerName LIKE ? OR flatNumber LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/vehicles/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM parking WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/vehicles', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO parking (id,slotNumber,type,status,vehicleNumber,vehicleType,flatNumber,ownerName) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.slotNumber||`V-${Date.now()}`, b.type||'four_wheeler', 'occupied', b.vehicleNumber||'', b.vehicleType||b.type||'', b.flatNumber||'', b.ownerName||'']
    );
    const [rows] = await pool.execute('SELECT * FROM parking WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/api/vehicles/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['slotNumber','type','status','vehicleNumber','vehicleType','flatNumber','ownerName']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE parking SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.delete('/api/vehicles/:id', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM parking WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// KYC
app.get('/api/kyc', requireSociety, async (req, res) => { res.json([]); });
app.post('/api/kyc', requireSociety, async (req, res) => { res.json({ message: 'KYC submitted', data: req.body }); });
app.post('/api/kyc/:id/approve', requireSociety, async (req, res) => { res.json({ message: 'KYC approved', id: req.params.id }); });
app.post('/api/kyc/:id/reject', requireSociety, async (req, res) => { res.json({ message: 'KYC rejected', id: req.params.id }); });

// Blacklist
app.get('/api/blacklist', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE status="rejected" ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/blacklist', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO visitors (id,name,phone,purpose,flatNumber,tower,status,vehicleNumber) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.phone||'', b.reason||'Blacklisted', b.flatNumber||'', b.tower||'', 'rejected', b.vehicleNumber||'']);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AMC
app.get('/api/amc', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM assets WHERE warrantyExpiry IS NOT NULL ORDER BY warrantyExpiry');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/amc', requireSociety, async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO assets (id,name,category,`condition`,value,location,purchaseDate,warrantyExpiry,description) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.category||'AMC', b.condition||'good', Number(b.value)||0, b.location||'', b.purchaseDate||null, b.warrantyExpiry||b.endDate||null, b.description||'']);
    const [rows] = await pool.execute('SELECT * FROM assets WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// SMS placeholder
app.post('/api/sms/send', async (req, res) => { res.json({ message: 'SMS queued', data: req.body }); });

// Complaints
app.use('/api/complaints', requireSociety, complaintsRoutes);

// Notices
app.use('/api/notices', requireSociety, noticesRoutes);

// Visitors
app.use('/api/visitors', requireSociety, visitorsRoutes);

// Parking
app.use('/api/parking', requireSociety, parkingRoutes);

// Staff
app.use('/api/staff', requireSociety, staffRoutes);

// Vendors
app.use('/api/vendors', requireSociety, vendorsRoutes);

// Billing
app.use('/api/billing', requireSociety, billingRoutes);

// Facilities
app.use('/api/facilities', requireSociety, facilitiesRoutes);

// Assets
app.use('/api/assets', requireSociety, assetsRoutes);

// Gate Passes
app.use('/api/gate-pass', requireSociety, gatePassesRoutes);
app.use('/api/gate-passes', requireSociety, gatePassesRoutes);

// Emergencies
app.use('/api/emergencies', requireSociety, emergenciesRoutes);
app.use('/api/emergency', requireSociety, emergenciesRoutes);

// Announcements
app.use('/api/announcements', requireSociety, announcementsRoutes);

// Documents
app.use('/api/documents', requireSociety, documentsRoutes);

// Move Requests
app.use('/api/move-requests', requireSociety, moveRequestsRoutes);
app.use('/api/move', requireSociety, moveRequestsRoutes);

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
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Society Management Backend running on port ${PORT}`);
      console.log(`   Database: MySQL (Multi-tenant)`);
      console.log(`   WebSocket: Enabled (Socket.IO)`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
