import { Router } from 'express';
import { getMasterPool, getSocietyPool } from '../../config/database.js';
import { parseJSON, buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const pool = getMasterPool();
    const [rows] = await pool.execute(
      'SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt,updatedAt FROM users WHERE id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const u = rows[0]; u.permissions = parseJSON(u.permissions);

    // If user belongs to a society, get society info
    if (u.societyId) {
      const [soc] = await pool.execute('SELECT id,name,address,city,state,phone,email FROM societies WHERE id=?', [u.societyId]);
      u.society = soc[0] || null;

      // Get resident profile from society DB
      try {
        const socPool = getSocietyPool(u.societyId);
        const [residents] = await socPool.execute(
          'SELECT * FROM residents WHERE email=? OR phone=? LIMIT 1',
          [u.email || '', u.phone || '']
        );
        u.residentProfile = residents[0] || null;
      } catch (e) {
        u.residentProfile = null;
      }
    }
    res.json(u);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const pool = getMasterPool();
    const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name', 'email', 'phone', 'fcmToken']);
    if (fields.length) {
      values.push(req.user.id);
      await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values);
    }
    const [rows] = await pool.execute(
      'SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt,updatedAt FROM users WHERE id=?',
      [req.user.id]
    );
    const u = rows[0]; if (u) u.permissions = parseJSON(u.permissions);
    res.json(u || { message: 'Updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/change-password
router.post('/change-password', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const pool = getMasterPool();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both currentPassword and newPassword required' });

    const [users] = await pool.execute('SELECT password FROM users WHERE id=?', [req.user.id]);
    if (!users.length || users[0].password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await pool.execute('UPDATE users SET password=? WHERE id=?', [newPassword, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
