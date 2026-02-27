import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM vendor_payments ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO vendor_payments (id,vendorId,vendorName,amount,paymentDate,method,status,receiptNo,description) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, body.vendorId||null, body.vendorName||'', body.amount||0, body.paymentDate||null, body.method||'bank_transfer', body.status||'pending', body.receiptNo||'', body.description||'']);
    const [rows] = await pool.execute('SELECT * FROM vendor_payments WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
