import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const { userId, password } = await request.json();

    const [users] = await pool.execute('SELECT * FROM users WHERE userId = ?', [userId]);
    if (users.length === 0) return errorResponse('Invalid credentials', 401);

    const user = users[0];
    if (user.password !== password) return errorResponse('Invalid credentials', 401);

    const token = uuidv4();
    const permissions = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : [];
    const isFirstLogin = user.firstLogin;

    if (isFirstLogin) {
      await pool.execute('UPDATE users SET firstLogin = FALSE WHERE id = ?', [user.id]);
    }

    // Get towers if user has a society
    let towers = [];
    if (user.societyId) {
      try {
        const { getSocietyPool } = await import('@/lib/mysql');
        const socPool = getSocietyPool(user.societyId);
        const [towerRows] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        towers = towerRows;
      } catch (e) { console.log('No society DB yet'); }
    }

    return jsonResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        role: user.role,
        societyId: user.societyId,
        permissions,
        isFirstLogin,
      },
      towers,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Server error: ' + error.message);
  }
}
