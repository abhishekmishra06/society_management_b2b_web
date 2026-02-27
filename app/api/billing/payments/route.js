import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const [rows] = await pool.execute('SELECT * FROM billing_payments ORDER BY createdAt DESC');
    return jsonResponse(rows);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}

export async function POST(request) {
  try {
    const societyId = getSocietyId(request); if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);
    const body = await request.json(); const id = uuidv4();
    await pool.execute('INSERT INTO billing_payments (id,billingId,flatNumber,amount,method,transactionId,receiptNo,status) VALUES (?,?,?,?,?,?,?,?)',
      [id, body.billingId||null, body.flatNumber||'', body.amount||0, body.method||'', body.transactionId||'', body.receiptNo||'', body.status||'success']);
    if (body.billingId) { await pool.execute('UPDATE billing SET status=?,paidDate=NOW(),paidAmount=? WHERE id=?', ['paid', body.amount||0, body.billingId]); }
    const [rows] = await pool.execute('SELECT * FROM billing_payments WHERE id=?',[id]);
    return jsonResponse(rows[0]);
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
