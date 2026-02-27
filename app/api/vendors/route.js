import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request);
    if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM vendors ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request);
    if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO vendors (id,name,company,service,phone,email,status,address) VALUES (?,?,?,?,?,?,?,?)',
      [id, body.name||'', body.company||'', body.service||'', body.phone||'', body.email||'', body.status||'active', body.address||'']);
    const [rows] = await pool.execute('SELECT * FROM vendors WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function PUT(request) {
  try {
    const societyId = getSocietyId(request);
    if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json();
    if (!body.id) return errorResponse('ID required', 400);
    const fields=[]; const values=[];
    ['name','company','service','phone','email','status','address'].forEach(k=>{if(body[k]!==undefined){fields.push(`${k}=?`);values.push(body[k]);}});
    if(fields.length>0){values.push(body.id);await pool.execute(`UPDATE vendors SET ${fields.join(',')} WHERE id=?`,values);}
    return jsonResponse({message:'Updated',id:body.id});
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function DELETE(request) {
  try {
    const societyId = getSocietyId(request);
    if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const url = new URL(request.url); const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID required', 400);
    await pool.execute('DELETE FROM vendors WHERE id=?',[id]);
    return jsonResponse({message:'Deleted',id});
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
