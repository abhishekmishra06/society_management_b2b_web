import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../../config/database.js';
import { sendPushNotification, sendMulticastNotification } from '../../config/firebase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    let q = 'SELECT * FROM notifications WHERE 1=1'; const p = [];
    if (req.query.userId) { q+=' AND (targetUserId=? OR targetUserId IS NULL)'; p.push(req.query.userId); }
    if (req.query.societyId) { q+=' AND (societyId=? OR societyId IS NULL)'; p.push(req.query.societyId); }
    q+=' ORDER BY createdAt DESC LIMIT ?'; p.push(parseInt(req.query.limit||'50'));
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO notifications (id,societyId,title,body,type,targetUserId,sentBy) VALUES (?,?,?,?,?,?,?)',
      [id, b.societyId||null, b.title||'', b.body||'', b.type||'general', b.targetUserId||null, b.sentBy||null]);

    let pushResult = null;
    if (b.targetUserId) {
      const [users] = await pool.execute('SELECT fcmToken FROM users WHERE id=? AND fcmToken IS NOT NULL', [b.targetUserId]);
      if (users[0]?.fcmToken) pushResult = await sendPushNotification(users[0].fcmToken, b.title, b.body, {notificationId:id,type:b.type||'general'});
    } else if (b.societyId) {
      const [users] = await pool.execute('SELECT fcmToken FROM users WHERE societyId=? AND fcmToken IS NOT NULL AND fcmToken != ""', [b.societyId]);
      const tokens = users.map(u=>u.fcmToken).filter(Boolean);
      if (tokens.length) pushResult = await sendMulticastNotification(tokens, b.title, b.body, {notificationId:id,type:b.type||'general'});
    }
    res.json({ id, message: 'Notification sent', pushResult });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('UPDATE notifications SET isRead=TRUE WHERE id=?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
