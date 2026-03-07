import { Router } from 'express';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-dashboard - Summary for user
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);

    const today = new Date().toISOString().split('T')[0];
    const [activeNotices] = await pool.execute('SELECT COUNT(*) as c FROM notices WHERE status="active"');
    const [activeEmergencies] = await pool.execute('SELECT COUNT(*) as c FROM emergencies WHERE status="active"');
    const [todayVisitors] = await pool.execute('SELECT COUNT(*) as c FROM visitors WHERE DATE(createdAt)=?', [today]);
    const [pendingBills] = await pool.execute('SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM billing WHERE status="pending"');
    const [upcomingBookings] = await pool.execute('SELECT COUNT(*) as c FROM facility_bookings WHERE status="pending"');
    const [openComplaints] = await pool.execute('SELECT COUNT(*) as c FROM complaints WHERE status="open"');

    // Recent activities
    const [recentNotices] = await pool.execute('SELECT id,title,category,createdAt FROM notices WHERE status="active" ORDER BY createdAt DESC LIMIT 5');
    const [recentComplaints] = await pool.execute('SELECT id,title,status,priority,createdAt FROM complaints ORDER BY createdAt DESC LIMIT 5');

    res.json({
      activeNotices: activeNotices[0].c,
      activeEmergencies: activeEmergencies[0].c,
      todayVisitors: todayVisitors[0].c,
      pendingBillsCount: pendingBills[0].c,
      pendingBillsAmount: Number(pendingBills[0].total),
      upcomingBookings: upcomingBookings[0].c,
      openComplaints: openComplaints[0].c,
      recentNotices,
      recentComplaints,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
