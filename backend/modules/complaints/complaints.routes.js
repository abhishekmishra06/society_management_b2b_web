import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM complaints WHERE 1=1';
    const p = [];
    if (req.query.search) {
      q += ' AND (title LIKE ? OR description LIKE ? OR flatNumber LIKE ? OR reportedBy LIKE ?)';
      const s = `%${req.query.search}%`; p.push(s, s, s, s);
    }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.priority) { q += ' AND priority=?'; p.push(req.query.priority); }
    if (req.query.category) { q += ' AND category=?'; p.push(req.query.category); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/complaints/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO complaints (id,title,description,category,status,priority,reportedBy,flatNumber,assignedTo) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.title||'', b.description||'', b.category||'general', b.status||'open', b.priority||'medium', b.reportedBy||'', b.flatNumber||'', b.assignedTo||'']
    );
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/complaints/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['title','description','category','status','priority','reportedBy','flatNumber','assignedTo']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE complaints SET ${fields.join(',')} WHERE id=?`, values); }
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id=?', [req.params.id]);
    res.json(rows[0] || { message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/complaints/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM complaints WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
