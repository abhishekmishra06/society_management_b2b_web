import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM emergencies ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO emergencies (id,type,description,reportedBy,flatNumber,status) VALUES (?,?,?,?,?,?)',
      [id, body.type||'general', body.description||'', body.reportedBy||'', body.flatNumber||'', body.status||'active']);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function PUT(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json();
    if (!body.id) return errorResponse('ID required', 400);
    if (body.status === 'resolved') {
      await pool.execute('UPDATE emergencies SET status=?,resolvedAt=NOW(),resolvedBy=? WHERE id=?', [body.status, body.resolvedBy||'', body.id]);
    } else {
      const fields=[]; const values=[];
      ['type','description','status'].forEach(k=>{if(body[k]!==undefined){fields.push(`${k}=?`);values.push(body[k]);}});
      if(fields.length>0){values.push(body.id);await pool.execute(`UPDATE emergencies SET ${fields.join(',')} WHERE id=?`,values);}
    }
    return jsonResponse({message:'Updated',id:body.id});
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
