import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../../config/database.js';
import { generateToken } from '../../middleware/auth.js';
import { parseJSON } from '../../utils/helpers.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const pool = getMasterPool();
    const { userId, password } = req.body;
    const [users] = await pool.execute('SELECT * FROM users WHERE userId=?', [userId]);
    if (!users.length || users[0].password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const token = generateToken(user);
    const permissions = parseJSON(user.permissions);
    const isFirstLogin = user.firstLogin;
    if (isFirstLogin) await pool.execute('UPDATE users SET firstLogin=FALSE WHERE id=?', [user.id]);

    let towers = [];
    if (user.societyId) {
      try {
        const { getSocietyPool } = await import('../../config/database.js');
        const socPool = getSocietyPool(user.societyId);
        const [t] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        towers = t;
      } catch(e) {}
    }

    res.json({ token, user: { id: user.id, name: user.name, userId: user.userId, email: user.email, phone: user.phone, role: user.role, societyId: user.societyId, permissions, isFirstLogin }, towers });
  } catch (error) { console.error('[Auth]', error); res.status(500).json({ error: error.message }); }
});

export default router;
