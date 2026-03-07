import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM visitors WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR phone LIKE ? OR flatNumber LIKE ? OR purpose LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.flatNumber) { q += ' AND flatNumber=?'; p.push(req.query.flatNumber); }
    if (req.query.date) { q += ' AND DATE(createdAt)=?'; p.push(req.query.date); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO visitors (id,name,phone,purpose,flatNumber,tower,status,vehicleNumber,checkInTime,approvedBy) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.phone||'', b.purpose||'', b.flatNumber||'', b.tower||'', b.status||'expected', b.vehicleNumber||'', b.checkInTime||null, b.approvedBy||'']
    );
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Approve visitor (check in)
router.post('/:id/approve', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('UPDATE visitors SET status=?, checkInTime=NOW(), approvedBy=? WHERE id=?',
      ['checked_in', req.body.approvedBy||'', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Exit visitor (check out)
router.post('/:id/exit', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('UPDATE visitors SET status=?, checkOutTime=NOW() WHERE id=?', ['checked_out', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM visitors WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','phone','purpose','flatNumber','tower','status','vehicleNumber','checkInTime','checkOutTime','approvedBy']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE visitors SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM visitors WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
