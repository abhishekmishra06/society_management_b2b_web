import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM notices WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (title LIKE ? OR description LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.category) { q += ' AND category=?'; p.push(req.query.category); }
    if (req.query.priority) { q += ' AND priority=?'; p.push(req.query.priority); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM notices WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO notices (id,title,description,category,priority,status,postedBy) VALUES (?,?,?,?,?,?,?)',
      [id, b.title||'', b.description||'', b.category||'general', b.priority||'medium', b.status||'active', b.postedBy||'']);
    const [rows] = await pool.execute('SELECT * FROM notices WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['title','description','category','priority','status','postedBy']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE notices SET ${fields.join(',')} WHERE id=?`, values); }
    const [rows] = await pool.execute('SELECT * FROM notices WHERE id=?', [req.params.id]);
    res.json(rows[0] || { message: 'Updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM notices WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
