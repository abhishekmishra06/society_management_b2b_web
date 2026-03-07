import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/residents - List all with search/filter
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM residents WHERE 1=1';
    const p = [];

    if (req.query.search) {
      q += ' AND (name LIKE ? OR flatNumber LIKE ? OR phone LIKE ? OR email LIKE ? OR tower LIKE ?)';
      const s = `%${req.query.search}%`;
      p.push(s, s, s, s, s);
    }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.tower) { q += ' AND tower=?'; p.push(req.query.tower); }
    if (req.query.flatNumber) { q += ' AND flatNumber=?'; p.push(req.query.flatNumber); }

    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/residents/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Resident not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/residents
router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body;
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO residents (id,name,flatNumber,tower,phone,email,type,status,vehicleNumber,aadhaarNumber,moveInDate,emergencyContact) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.flatNumber||'', b.tower||'', b.phone||'', b.email||'', b.type||'owner', b.status||'active', b.vehicleNumber||'', b.aadhaarNumber||'', b.moveInDate||null, b.emergencyContact||'']
    );

    // Update flat status to occupied if flatNumber provided
    if (b.flatNumber && b.tower) {
      await pool.execute('UPDATE flats SET status=?, ownerName=?, ownerPhone=?, ownerEmail=? WHERE flatNumber=? AND towerName=?',
        ['occupied', b.name||'', b.phone||'', b.email||'', b.flatNumber, b.tower]).catch(() => {});
    }

    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/residents/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','flatNumber','tower','phone','email','type','status','vehicleNumber','aadhaarNumber','moveInDate','emergencyContact']);
    if (fields.length) {
      values.push(req.params.id);
      await pool.execute(`UPDATE residents SET ${fields.join(',')} WHERE id=?`, values);
    }
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [req.params.id]);
    res.json(rows[0] || { message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/residents/:id/deactivate
router.put('/:id/deactivate', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('UPDATE residents SET status=? WHERE id=?', ['inactive', req.params.id]);
    res.json({ message: 'Resident deactivated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/residents/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM residents WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/residents/:id/family - placeholder for family members
router.get('/:id/family', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [resident] = await pool.execute('SELECT * FROM residents WHERE id=?', [req.params.id]);
    if (!resident.length) return res.status(404).json({ error: 'Resident not found' });
    // Get all residents in the same flat as family
    const [family] = await pool.execute('SELECT * FROM residents WHERE flatNumber=? AND tower=? AND id!=?',
      [resident[0].flatNumber, resident[0].tower, req.params.id]);
    res.json(family);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/residents/:id/family
router.post('/:id/family', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [resident] = await pool.execute('SELECT * FROM residents WHERE id=?', [req.params.id]);
    if (!resident.length) return res.status(404).json({ error: 'Resident not found' });
    const b = req.body;
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO residents (id,name,flatNumber,tower,phone,email,type,status,vehicleNumber,aadhaarNumber,moveInDate,emergencyContact) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', resident[0].flatNumber, resident[0].tower, b.phone||'', b.email||'', b.type||'family', 'active', b.vehicleNumber||'', b.aadhaarNumber||'', b.moveInDate||null, b.emergencyContact||'']
    );
    const [rows] = await pool.execute('SELECT * FROM residents WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
