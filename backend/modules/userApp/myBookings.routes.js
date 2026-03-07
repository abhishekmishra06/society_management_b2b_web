import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// GET /api/user/my-bookings
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    let q = 'SELECT * FROM facility_bookings WHERE 1=1';
    const p = [];
    if (req.query.flatNumber) { q += ' AND flatNumber=?'; p.push(req.query.flatNumber); }
    if (req.query.bookedBy) { q += ' AND bookedBy=?'; p.push(req.query.bookedBy); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/my-bookings
router.post('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO facility_bookings (id,facilityId,facilityName,bookedBy,flatNumber,bookingDate,startTime,endTime,purpose,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.facilityId||null, b.facilityName||'', req.user.name||b.bookedBy||'', b.flatNumber||'', b.bookingDate||null, b.startTime||'', b.endTime||'', b.purpose||'', 'pending']
    );
    const [rows] = await pool.execute('SELECT * FROM facility_bookings WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/user/my-bookings/:id - Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    await pool.execute('UPDATE facility_bookings SET status=? WHERE id=?', ['cancelled', req.params.id]);
    res.json({ message: 'Booking cancelled', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/user/my-bookings/facilities - Available facilities
router.get('/facilities', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const [rows] = await pool.execute('SELECT * FROM facilities WHERE status="available" ORDER BY name');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
