import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM parking WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (slotNumber LIKE ? OR vehicleNumber LIKE ? OR flatNumber LIKE ? OR ownerName LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    q += ' ORDER BY slotNumber';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM parking WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO parking (id,slotNumber,type,status,vehicleNumber,vehicleType,flatNumber,ownerName) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.slotNumber||'', b.type||'four_wheeler', b.status||'available', b.vehicleNumber||'', b.vehicleType||'', b.flatNumber||'', b.ownerName||'']
    );
    const [rows] = await pool.execute('SELECT * FROM parking WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['slotNumber','type','status','vehicleNumber','vehicleType','flatNumber','ownerName']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE parking SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM parking WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
