import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return errorResponse('userId required', 400);

    const [rows] = await pool.execute('SELECT id, name, userId, email, phone, role, societyId, permissions FROM users WHERE userId = ?', [userId]);
    if (rows.length === 0) return errorResponse('User not found', 404);
    const user = rows[0];
    user.permissions = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : [];
    return jsonResponse(user);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function PUT(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();
    if (!body.userId) return errorResponse('userId required', 400);

    const fields = []; const values = [];
    ['name','email','phone'].forEach(k => { if(body[k] !== undefined){ fields.push(`${k}=?`); values.push(body[k]); }});
    if (body.password) { fields.push('password=?'); values.push(body.password); }
    if (fields.length > 0) {
      values.push(body.userId);
      await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE userId=?`, values);
    }
    return jsonResponse({ message: 'Profile updated' });
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
