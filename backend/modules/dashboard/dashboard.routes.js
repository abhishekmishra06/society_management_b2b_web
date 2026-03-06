import { Router } from 'express';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [residents] = await pool.execute('SELECT COUNT(*) as c FROM residents');
    const [towers] = await pool.execute('SELECT COUNT(*) as c FROM towers');
    const [flats] = await pool.execute('SELECT COUNT(*) as c FROM flats');
    const [complaints] = await pool.execute('SELECT COUNT(*) as c FROM complaints WHERE status IN ("open","in_progress")');
    const [visitors] = await pool.execute('SELECT COUNT(*) as c FROM visitors WHERE status="checked_in"');
    const [billing] = await pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM billing WHERE status="pending"');
    const [parking] = await pool.execute('SELECT COUNT(*) as c FROM parking');
    const [vehicles] = await pool.execute('SELECT COUNT(*) as c FROM parking WHERE status="occupied"');
    res.json({ totalResidents: residents[0].c, totalTowers: towers[0].c, totalFlats: flats[0].c,
      complaintsThisMonth: complaints[0].c, activeVisitors: visitors[0].c, totalBillsAmount: Number(billing[0].total),
      totalParking: parking[0].c, totalVehicles: vehicles[0].c });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
