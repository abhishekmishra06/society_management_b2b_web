import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../../config/database.js';
import { generateToken } from '../../middleware/auth.js';
import { parseJSON } from '../../utils/helpers.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {


  console.log('[Auth] Login attempt:', req.body);
  try {
    const pool = getMasterPool();
    const { userId, email, password } = req.body;
    const loginId = userId || email;
    if (!loginId || !password) return res.status(400).json({ error: 'User ID and password are required' });

    // Search by userId or email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE userId=? OR email=?', [loginId, loginId]
    );
    if (!users.length || users[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const token = generateToken(user);
    const permissions = parseJSON(user.permissions);
    const isFirstLogin = user.firstLogin ? true : false;
    if (isFirstLogin) await pool.execute('UPDATE users SET firstLogin=FALSE WHERE id=?', [user.id]);

    let towers = [];
    if (user.societyId) {
      try {
        const { getSocietyPool } = await import('../../config/database.js');
        const socPool = getSocietyPool(user.societyId);
        const [t] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        towers = t;
      } catch(e) { console.log('[Auth] Could not fetch towers for society:', e.message); }
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        userId: user.userId,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        societyId: user.societyId || null,
        permissions,
        isFirstLogin,
      },
      towers
    });
  } catch (error) {
    console.error('[Auth]', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    const pool = getMasterPool();
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) return res.status(400).json({ error: 'All fields required' });

    const [users] = await pool.execute('SELECT * FROM users WHERE id=? OR userId=?', [userId, userId]);
    if (!users.length || users[0].password !== currentPassword) return res.status(401).json({ error: 'Current password is incorrect' });

    await pool.execute('UPDATE users SET password=? WHERE id=?', [newPassword, users[0].id]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/auth/register (for society admins registering new users)
router.post('/register', async (req, res) => {
  try {
    const pool = getMasterPool();
    const b = req.body;
    const id = uuidv4();
    const userId = b.userId || `user_${Date.now()}`;

    // Check if userId already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE userId=?', [userId]);
    if (existing.length) return res.status(400).json({ error: 'User ID already exists' });

    await pool.execute(
      'INSERT INTO users (id,name,userId,password,email,phone,role,societyId,permissions) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', userId, b.password||'password123', b.email||'', b.phone||'', b.role||'RESIDENT', b.societyId||null, JSON.stringify(b.permissions||[])]
    );

    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,createdAt FROM users WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
