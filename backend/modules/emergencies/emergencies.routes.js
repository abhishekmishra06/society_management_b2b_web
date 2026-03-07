import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// Sub-routes MUST be before /:id

// GET active emergencies
router.get('/active', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE status="active" ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Trigger emergency
router.post('/trigger', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO emergencies (id,type,description,reportedBy,flatNumber,status) VALUES (?,?,?,?,?,?)',
      [id, b.type||'general', b.description||'', b.reportedBy||'', b.flatNumber||'', 'active']);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET all emergencies
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM emergencies ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Resolve emergency
router.post('/:id/resolve', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('UPDATE emergencies SET status=?, resolvedAt=NOW(), resolvedBy=? WHERE id=?',
      ['resolved', req.body.resolvedBy||'', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['type','description','status','resolvedBy']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE emergencies SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM emergencies WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
