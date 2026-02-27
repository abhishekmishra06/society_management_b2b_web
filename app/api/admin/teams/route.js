import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET() {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const [teams] = await pool.execute('SELECT * FROM teams ORDER BY createdAt DESC');
    const [members] = await pool.execute('SELECT * FROM team_members');

    return jsonResponse(teams.map(t => ({
      ...t,
      permissions: t.permissions ? (typeof t.permissions === 'string' ? JSON.parse(t.permissions) : t.permissions) : [],
      members: members.filter(m => m.teamId === t.id).map(m => m.userId),
    })));
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();
    const id = uuidv4();

    await pool.execute(
      'INSERT INTO teams (id, societyId, name, description, permissions, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.societyId || null, body.name || '', body.description || '', JSON.stringify(body.permissions || []), body.status || 'active']
    );

    const [rows] = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);
    const team = rows[0];
    team.permissions = team.permissions ? (typeof team.permissions === 'string' ? JSON.parse(team.permissions) : team.permissions) : [];
    team.members = [];
    return jsonResponse(team);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
