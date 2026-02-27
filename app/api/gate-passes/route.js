import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM gate_passes ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO gate_passes (id,type,name,phone,flatNumber,purpose,vehicleNumber,status,validUntil,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, body.type||'visitor', body.name||'', body.phone||'', body.flatNumber||'', body.purpose||'', body.vehicleNumber||'', body.status||'active', body.validUntil||null, body.createdBy||'']);
    const [rows] = await pool.execute('SELECT * FROM gate_passes WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
