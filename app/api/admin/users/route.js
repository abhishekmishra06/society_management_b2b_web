import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET() {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT id, name, userId, email, phone, role, societyId, permissions, fcmToken, firstLogin, createdAt, updatedAt FROM users ORDER BY createdAt DESC');
    return jsonResponse(rows.map(r => ({ ...r, permissions: r.permissions ? (typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions) : [] })));
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();

    // Check duplicate
    const [existing] = await pool.execute('SELECT id FROM users WHERE userId = ?', [body.userId]);
    if (existing.length > 0) return errorResponse('User ID already exists', 400);

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, name, userId, password, email, phone, role, societyId, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name || '', body.userId, body.password || 'password', body.email || '', body.phone || '', body.role || 'STAFF', body.societyId || null, JSON.stringify(body.permissions || [])]
    );

    const [rows] = await pool.execute('SELECT id, name, userId, email, phone, role, societyId, permissions, createdAt FROM users WHERE id = ?', [id]);
    const user = rows[0];
    user.permissions = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : [];
    return jsonResponse(user);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
