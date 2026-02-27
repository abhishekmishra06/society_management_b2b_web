import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT id, name, userId, email, phone, role, societyId, permissions, createdAt FROM users ORDER BY createdAt DESC');
    return jsonResponse(rows.map(r => ({ ...r, permissions: r.permissions ? (typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions) : [] })));
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
