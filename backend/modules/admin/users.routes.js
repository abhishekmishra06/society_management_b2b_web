import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../../config/database.js';
import { parseJSON, buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/users
router.get('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    let q = 'SELECT id,name,userId,email,phone,role,societyId,permissions,fcmToken,firstLogin,createdAt,updatedAt FROM users WHERE 1=1';
    const p = [];
    if (req.query.search) {
      q += ' AND (name LIKE ? OR userId LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${req.query.search}%`; p.push(s, s, s, s);
    }
    if (req.query.role) { q += ' AND role=?'; p.push(req.query.role); }
    if (req.query.societyId) { q += ' AND societyId=?'; p.push(req.query.societyId); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows.map(r => ({ ...r, permissions: parseJSON(r.permissions) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/admin/users/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,fcmToken,firstLogin,createdAt,updatedAt FROM users WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const u = rows[0]; u.permissions = parseJSON(u.permissions);
    res.json(u);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/users
router.post('/', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE userId=?', [b.userId]);
    if (existing.length) return res.status(400).json({ error: 'User ID already exists' });
    const id = uuidv4();
    await pool.execute('INSERT INTO users (id,name,userId,password,email,phone,role,societyId,permissions) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.userId, b.password||'password', b.email||'', b.phone||'', b.role||'STAFF', b.societyId||null, JSON.stringify(b.permissions||[])]);
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt FROM users WHERE id=?', [id]);
    const u = rows[0]; u.permissions = parseJSON(u.permissions);
    res.json(u);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/users/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','email','phone','role','societyId','fcmToken']);
    if (b.password) { fields.push('password=?'); values.push(b.password); }
    if (b.permissions !== undefined) { fields.push('permissions=?'); values.push(JSON.stringify(b.permissions)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values); }
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt FROM users WHERE id=?', [req.params.id]);
    const u = rows[0]; if (u) u.permissions = parseJSON(u.permissions);
    res.json(u || { message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
