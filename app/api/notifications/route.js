import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { sendPushNotification, sendMulticastNotification } from '@/lib/firebase';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

// GET all notifications for a user
export async function GET(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const societyId = url.searchParams.get('societyId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (userId) { query += ' AND (targetUserId = ? OR targetUserId IS NULL)'; params.push(userId); }
    if (societyId) { query += ' AND (societyId = ? OR societyId IS NULL)'; params.push(societyId); }
    query += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.execute(query, params);
    return jsonResponse(rows);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

// POST send notification
export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();
    const id = uuidv4();

    // Save notification to DB
    await pool.execute(
      'INSERT INTO notifications (id, societyId, title, body, type, targetUserId, sentBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, body.societyId || null, body.title || '', body.body || '', body.type || 'general', body.targetUserId || null, body.sentBy || null]
    );

    // Send Firebase push notification
    let pushResult = null;
    if (body.targetUserId) {
      // Send to specific user
      const [users] = await pool.execute('SELECT fcmToken FROM users WHERE id = ? AND fcmToken IS NOT NULL', [body.targetUserId]);
      if (users.length > 0 && users[0].fcmToken) {
        pushResult = await sendPushNotification(users[0].fcmToken, body.title, body.body, { notificationId: id, type: body.type || 'general' });
      }
    } else if (body.societyId) {
      // Send to all users in a society
      const [users] = await pool.execute('SELECT fcmToken FROM users WHERE societyId = ? AND fcmToken IS NOT NULL AND fcmToken != ?', [body.societyId, '']);
      const tokens = users.map(u => u.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        pushResult = await sendMulticastNotification(tokens, body.title, body.body, { notificationId: id, type: body.type || 'general' });
      }
    } else if (body.broadcast) {
      // Broadcast to all users
      const [users] = await pool.execute('SELECT fcmToken FROM users WHERE fcmToken IS NOT NULL AND fcmToken != ?', ['']);
      const tokens = users.map(u => u.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        pushResult = await sendMulticastNotification(tokens, body.title, body.body, { notificationId: id, type: body.type || 'general' });
      }
    }

    return jsonResponse({ id, message: 'Notification sent', pushResult });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
