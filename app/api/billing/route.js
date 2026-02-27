import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM billing ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO billing (id,flatNumber,tower,residentName,amount,type,month,year,dueDate,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, body.flatNumber||'', body.tower||'', body.residentName||'', body.amount||0, body.type||'maintenance', body.month||'', body.year||null, body.dueDate||null, body.status||'pending']);
    const [rows] = await pool.execute('SELECT * FROM billing WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function PUT(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json();
    if (!body.id) return errorResponse('ID required', 400);
    const fields=[]; const values=[];
    ['flatNumber','tower','residentName','amount','type','month','year','dueDate','status','paidDate','paidAmount','paymentMethod','receiptNo'].forEach(k=>{if(body[k]!==undefined){fields.push(`${k}=?`);values.push(body[k]);}});
    if(fields.length>0){values.push(body.id);await pool.execute(`UPDATE billing SET ${fields.join(',')} WHERE id=?`,values);}
    return jsonResponse({message:'Updated',id:body.id});
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function DELETE(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const url = new URL(request.url); const id = url.searchParams.get('id');
    if (!id) return errorResponse('ID required', 400);
    await pool.execute('DELETE FROM billing WHERE id=?',[id]);
    return jsonResponse({message:'Deleted',id});
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
