import { getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function PUT(request, { params }) {
  try {
    await initMasterDB();
    const { id } = await params;
    const pool = getMasterPool();
    const body = await request.json();

    const fields = [];
    const values = [];
    ['name', 'description', 'societyId', 'status'].forEach(key => {
      if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]); }
    });
    if (body.permissions !== undefined) { fields.push('permissions = ?'); values.push(JSON.stringify(body.permissions)); }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return jsonResponse({ message: 'Team updated', id });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function DELETE(request, { params }) {
  try {
    await initMasterDB();
    const { id } = await params;
    const pool = getMasterPool();
    await pool.execute('DELETE FROM team_members WHERE teamId = ?', [id]);
    await pool.execute('DELETE FROM teams WHERE id = ?', [id]);
    return jsonResponse({ message: 'Team deleted', id });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
