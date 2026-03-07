import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// Staff Attendance - MUST be before /:id routes
router.get('/attendance', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [staff] = await pool.execute('SELECT * FROM staff WHERE status="active" ORDER BY name');
    res.json(staff.map(s => ({ ...s, attendance: 'present' })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/attendance', async (req, res) => {
  try {
    res.json({ message: 'Attendance marked', data: req.body });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Staff Salary - MUST be before /:id routes
router.get('/salary', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [staff] = await pool.execute('SELECT * FROM staff ORDER BY name');
    res.json(staff.map(s => ({ ...s, salaryAmount: s.salary || '0', lastPaid: null })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/salary', async (req, res) => {
  try {
    res.json({ message: 'Salary processed', data: req.body });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/staff
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM staff WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR role LIKE ? OR phone LIKE ? OR department LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.department) { q += ' AND department=?'; p.push(req.query.department); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM staff WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO staff (id,name,role,phone,email,department,status,joinDate,salary,address) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.role||'', b.phone||'', b.email||'', b.department||'', b.status||'active', b.joinDate||null, b.salary||'', b.address||'']
    );
    const [rows] = await pool.execute('SELECT * FROM staff WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','role','phone','email','department','status','joinDate','salary','address']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE staff SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM staff WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
