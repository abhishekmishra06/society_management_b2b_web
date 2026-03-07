import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-complaints
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);

    let q = 'SELECT * FROM complaints WHERE reportedBy=? OR flatNumber=?';
    const p = [req.user.name || '', req.body?.flatNumber || ''];

    // Allow filtering by flat number from user profile
    if (req.query.flatNumber) {
      q = 'SELECT * FROM complaints WHERE flatNumber=?';
      p.length = 0;
      p.push(req.query.flatNumber);
    }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/my-complaints
router.post('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO complaints (id,title,description,category,status,priority,reportedBy,flatNumber,assignedTo) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.title||'', b.description||'', b.category||'general', 'open', b.priority||'medium', req.user.name||b.reportedBy||'', b.flatNumber||'', '']
    );
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/user/my-complaints/:id
router.get('/:id', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
