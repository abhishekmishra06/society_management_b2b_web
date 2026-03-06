import { Router } from 'express';
import { getMasterPool } from '../../config/database.js';
import { parseJSON } from '../../utils/helpers.js';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt FROM users ORDER BY createdAt DESC');
    res.json(rows.map(r => ({ ...r, permissions: parseJSON(r.permissions) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Share access / update permissions
router.post('/share-access', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE userId=?', [b.userId]);
    if (existing.length) {
      await pool.execute('UPDATE users SET permissions=?,role=? WHERE userId=?', [JSON.stringify(b.permissions||[]), b.role||'STAFF', b.userId]);
      return res.json({ message: 'Permissions updated' });
    }
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    await pool.execute('INSERT INTO users (id,name,userId,password,email,phone,role,societyId,permissions) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.userId, b.password||'password', b.email||'', b.phone||'', b.role||'STAFF', b.societyId||null, JSON.stringify(b.permissions||[])]);
    res.json({ message: 'User created with access', id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET user profile
router.get('/profile', async (req, res) => {
  try {
    const pool = getMasterPool();
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions FROM users WHERE userId=?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const u = rows[0]; u.permissions = parseJSON(u.permissions);
    res.json(u);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT update profile
router.put('/profile', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    if (!b.userId) return res.status(400).json({ error: 'userId required' });
    const fields = []; const values = [];
    ['name','email','phone'].forEach(k => { if(b[k]!==undefined){fields.push(`${k}=?`);values.push(b[k]);} });
    if (b.password) { fields.push('password=?'); values.push(b.password); }
    if (fields.length) { values.push(b.userId); await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE userId=?`, values); }
    res.json({ message: 'Profile updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
