import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function POST(request, { params }) {
  try {
    await initMasterDB();
    const { id: teamId } = await params;
    const pool = getMasterPool();
    const { userId } = await request.json();

    const [existing] = await pool.execute('SELECT id FROM team_members WHERE teamId = ? AND userId = ?', [teamId, userId]);
    if (existing.length > 0) return errorResponse('User already in team', 400);

    await pool.execute('INSERT INTO team_members (id, teamId, userId) VALUES (?, ?, ?)', [uuidv4(), teamId, userId]);
    return jsonResponse({ message: 'Member added', teamId, userId });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
