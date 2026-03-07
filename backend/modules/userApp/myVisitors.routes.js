import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-visitors
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    let q = 'SELECT * FROM visitors WHERE 1=1';
    const p = [];
    if (req.query.flatNumber) { q += ' AND flatNumber=?'; p.push(req.query.flatNumber); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/my-visitors - Pre-approve a visitor
router.post('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO visitors (id,name,phone,purpose,flatNumber,tower,status,vehicleNumber,approvedBy) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.phone||'', b.purpose||'', b.flatNumber||'', b.tower||'', 'expected', b.vehicleNumber||'', req.user.name||'']
    );
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/my-visitors/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    await pool.execute('UPDATE visitors SET status=?, approvedBy=? WHERE id=?',
      ['expected', req.user.name||'', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/my-visitors/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    await pool.execute('UPDATE visitors SET status=? WHERE id=?', ['rejected', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
