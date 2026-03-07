import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// Bookings - MUST be before /:id to avoid conflict
router.get('/bookings', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM facility_bookings ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/bookings', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO facility_bookings (id,facilityId,facilityName,bookedBy,flatNumber,bookingDate,startTime,endTime,purpose,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.facilityId||null, b.facilityName||'', b.bookedBy||'', b.flatNumber||'', b.bookingDate||null, b.startTime||'', b.endTime||'', b.purpose||'', b.status||'pending']);
    const [rows] = await pool.execute('SELECT * FROM facility_bookings WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['facilityId','facilityName','bookedBy','flatNumber','bookingDate','startTime','endTime','purpose','status']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE facility_bookings SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM facility_bookings WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Facilities CRUD
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM facilities WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR type LIKE ? OR location LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM facilities WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO facilities (id,name,type,capacity,status,description,location,timings,charges) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.type||'', Number(b.capacity)||0, b.status||'available', b.description||'', b.location||'', b.timings||'', Number(b.charges)||0]);
    const [rows] = await pool.execute('SELECT * FROM facilities WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','type','capacity','status','description','location','timings','charges']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE facilities SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM facilities WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
