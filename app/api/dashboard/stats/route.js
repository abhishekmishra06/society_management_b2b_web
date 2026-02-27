import { getSocietyPool } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse, getSocietyId } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request) {
  try {
    const societyId = getSocietyId(request);
    if (!societyId) return errorResponse('Society ID required', 400);
    const pool = getSocietyPool(societyId);

    const [residents] = await pool.execute('SELECT COUNT(*) as cnt FROM residents');
    const [towers] = await pool.execute('SELECT COUNT(*) as cnt FROM towers');
    const [flats] = await pool.execute('SELECT COUNT(*) as cnt FROM flats');
    const [complaints] = await pool.execute('SELECT COUNT(*) as cnt FROM complaints WHERE status IN ("open","in_progress")');
    const [visitors] = await pool.execute('SELECT COUNT(*) as cnt FROM visitors WHERE status = "checked_in"');
    const [billing] = await pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM billing WHERE status = "pending"');
    const [parking] = await pool.execute('SELECT COUNT(*) as cnt FROM parking');
    const [vehicles] = await pool.execute('SELECT COUNT(*) as cnt FROM parking WHERE status = "occupied"');

    return jsonResponse({
      totalResidents: residents[0].cnt,
      totalTowers: towers[0].cnt,
      totalFlats: flats[0].cnt,
      complaintsThisMonth: complaints[0].cnt,
      activeVisitors: visitors[0].cnt,
      totalBillsAmount: Number(billing[0].total),
      totalParking: parking[0].cnt,
      totalVehicles: vehicles[0].cnt,
    });
  } catch (error) { return errorResponse('Server error: '+error.message); }
}
