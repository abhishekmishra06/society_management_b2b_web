import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();

    const [existing] = await pool.execute('SELECT id FROM users WHERE userId = ?', [body.userId]);
    if (existing.length > 0) {
      // Update existing user's permissions
      await pool.execute('UPDATE users SET permissions = ?, role = ? WHERE userId = ?', [JSON.stringify(body.permissions || []), body.role || 'STAFF', body.userId]);
      return jsonResponse({ message: 'User permissions updated', userId: body.userId });
    }

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, name, userId, password, email, phone, role, societyId, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name||'', body.userId, body.password||'password', body.email||'', body.phone||'', body.role||'STAFF', body.societyId||null, JSON.stringify(body.permissions||[])]
    );
    return jsonResponse({ message: 'User created with access', id });
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
