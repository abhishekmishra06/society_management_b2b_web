import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM assets WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR category LIKE ? OR location LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    if (req.query.category) { q += ' AND category=?'; p.push(req.query.category); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM assets WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO assets (id,name,category,`condition`,value,location,purchaseDate,warrantyExpiry,description) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.category||'', b.condition||'good', Number(b.value)||0, b.location||'', b.purchaseDate||null, b.warrantyExpiry||null, b.description||'']);
    const [rows] = await pool.execute('SELECT * FROM assets WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body;
    const fields = []; const values = [];
    ['name','category','value','location','purchaseDate','warrantyExpiry','description'].forEach(k => {
      if (b[k] !== undefined) { fields.push(`\`${k}\`=?`); values.push(b[k]); }
    });
    if (b.condition !== undefined) { fields.push('`condition`=?'); values.push(b.condition); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE assets SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM assets WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
