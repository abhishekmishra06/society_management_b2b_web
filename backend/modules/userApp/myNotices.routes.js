import { Router } from 'express';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-notices
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    let q = 'SELECT * FROM notices WHERE status="active"';
    const p = [];
    if (req.query.category) { q += ' AND category=?'; p.push(req.query.category); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/user/my-announcements
router.get('/announcements', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const [rows] = await pool.execute('SELECT * FROM announcements WHERE status="active" ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
