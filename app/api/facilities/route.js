import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM facilities ORDER BY name');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO facilities (id,name,type,capacity,status,description,location,timings,charges) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, body.name||'', body.type||'', body.capacity||0, body.status||'available', body.description||'', body.location||'', body.timings||'', body.charges||0]);
    const [rows] = await pool.execute('SELECT * FROM facilities WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
