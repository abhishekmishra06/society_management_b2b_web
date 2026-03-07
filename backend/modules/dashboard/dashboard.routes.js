import { Router } from 'express';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);

    // Core counts
    const [residents] = await pool.execute('SELECT COUNT(*) as c FROM residents');
    const [activeResidents] = await pool.execute('SELECT COUNT(*) as c FROM residents WHERE status="active"');
    const [towers] = await pool.execute('SELECT COUNT(*) as c FROM towers');
    const [flats] = await pool.execute('SELECT COUNT(*) as c FROM flats');
    const [occupiedFlats] = await pool.execute('SELECT COUNT(*) as c FROM flats WHERE status="occupied"');

    // Complaints
    const [totalComplaints] = await pool.execute('SELECT COUNT(*) as c FROM complaints');
    const [openComplaints] = await pool.execute('SELECT COUNT(*) as c FROM complaints WHERE status="open"');
    const [inProgressComplaints] = await pool.execute('SELECT COUNT(*) as c FROM complaints WHERE status="in_progress"');
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const [complaintsThisMonth] = await pool.execute('SELECT COUNT(*) as c FROM complaints WHERE createdAt >= ?', [firstOfMonth]);

    // Visitors
    const today = new Date().toISOString().split('T')[0];
    const [visitorsToday] = await pool.execute('SELECT COUNT(*) as c FROM visitors WHERE DATE(createdAt)=?', [today]);
    const [activeVisitors] = await pool.execute('SELECT COUNT(*) as c FROM visitors WHERE status="checked_in"');

    // Billing
    const [totalBills] = await pool.execute('SELECT COUNT(*) as c FROM billing');
    const [pendingBills] = await pool.execute('SELECT COUNT(*) as c FROM billing WHERE status="pending"');
    const [paidBills] = await pool.execute('SELECT COUNT(*) as c FROM billing WHERE status="paid"');
    const [overdueBills] = await pool.execute('SELECT COUNT(*) as c FROM billing WHERE status="overdue"');
    const [totalBillsAmount] = await pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM billing');
    const [pendingAmount] = await pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM billing WHERE status="pending"');
    const [paidAmount] = await pool.execute('SELECT COALESCE(SUM(paidAmount),0) as total FROM billing WHERE status="paid"');

    // Parking/vehicles
    const [totalParking] = await pool.execute('SELECT COUNT(*) as c FROM parking');
    const [occupiedParking] = await pool.execute('SELECT COUNT(*) as c FROM parking WHERE status="occupied"');

    // Move requests
    const [pendingMoves] = await pool.execute('SELECT COUNT(*) as c FROM move_requests WHERE status="pending"');

    // Staff
    const [activeStaff] = await pool.execute('SELECT COUNT(*) as c FROM staff WHERE status="active"');

    // Emergencies
    const [activeEmergencies] = await pool.execute('SELECT COUNT(*) as c FROM emergencies WHERE status="active"');

    res.json({
      // Core
      residents: residents[0].c,
      activeResidents: activeResidents[0].c,
      towers: towers[0].c,
      flats: flats[0].c,
      occupiedFlats: occupiedFlats[0].c,
      vacantFlats: flats[0].c - occupiedFlats[0].c,
      occupancyRate: flats[0].c > 0 ? Math.round((occupiedFlats[0].c / flats[0].c) * 100) : 0,
      // Vehicles/parking
      vehicles: occupiedParking[0].c,
      totalParking: totalParking[0].c,
      // Complaints
      totalComplaints: totalComplaints[0].c,
      openComplaints: openComplaints[0].c,
      inProgressComplaints: inProgressComplaints[0].c,
      complaintsThisMonth: complaintsThisMonth[0].c,
      // Visitors
      visitorsToday: visitorsToday[0].c,
      activeVisitors: activeVisitors[0].c,
      // Billing
      totalBills: totalBills[0].c,
      pendingBills: pendingBills[0].c,
      paidBills: paidBills[0].c,
      overdueBills: overdueBills[0].c,
      totalBillsAmount: Number(totalBillsAmount[0].total),
      pendingAmount: Number(pendingAmount[0].total),
      paidAmount: Number(paidAmount[0].total),
      // Other
      pendingMoves: pendingMoves[0].c,
      activeStaff: activeStaff[0].c,
      activeEmergencies: activeEmergencies[0].c,
    });
  } catch (error) {
    console.error('[Dashboard]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
