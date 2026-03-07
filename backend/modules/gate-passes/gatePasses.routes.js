import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM gate_passes WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR phone LIKE ? OR flatNumber LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO gate_passes (id,type,name,phone,flatNumber,purpose,vehicleNumber,status,validUntil,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.type||'visitor', b.name||'', b.phone||'', b.flatNumber||'', b.purpose||'', b.vehicleNumber||'', b.status||'active', b.validUntil||null, b.createdBy||'']
    );
    const [rows] = await pool.execute('SELECT * FROM gate_passes WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['type','name','phone','flatNumber','purpose','vehicleNumber','status','validUntil']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE gate_passes SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM gate_passes WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
