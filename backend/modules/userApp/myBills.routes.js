import { Router } from 'express';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-bills
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    let q = 'SELECT * FROM billing WHERE 1=1';
    const p = [];
    if (req.query.flatNumber) { q += ' AND flatNumber=?'; p.push(req.query.flatNumber); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/user/my-bills/summary
router.get('/summary', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const flatNumber = req.query.flatNumber || '';
    const [total] = await pool.execute('SELECT COALESCE(SUM(amount),0) as amount FROM billing WHERE flatNumber=?', [flatNumber]);
    const [pending] = await pool.execute('SELECT COALESCE(SUM(amount),0) as amount FROM billing WHERE flatNumber=? AND status="pending"', [flatNumber]);
    const [paid] = await pool.execute('SELECT COALESCE(SUM(paidAmount),0) as amount FROM billing WHERE flatNumber=? AND status="paid"', [flatNumber]);
    const [overdue] = await pool.execute('SELECT COALESCE(SUM(amount),0) as amount FROM billing WHERE flatNumber=? AND status="overdue"', [flatNumber]);
    res.json({
      totalAmount: Number(total[0].amount),
      pendingAmount: Number(pending[0].amount),
      paidAmount: Number(paid[0].amount),
      overdueAmount: Number(overdue[0].amount),
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
