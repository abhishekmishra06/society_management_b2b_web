import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool, getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request, { params }) {
  try {
    const { id: societyId } = await params;
    const socPool = getSocietyPool(societyId);
    const url = new URL(request.url);
    const towerId = url.searchParams.get('towerId');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');

    let query = 'SELECT * FROM flats WHERE 1=1';
    const queryParams = [];
    if (towerId) { query += ' AND towerId = ?'; queryParams.push(towerId); }
    if (status) { query += ' AND status = ?'; queryParams.push(status); }
    if (type) { query += ' AND type = ?'; queryParams.push(type); }
    if (search) { query += ' AND (flatNumber LIKE ? OR ownerName LIKE ? OR towerName LIKE ?)'; queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    query += ' ORDER BY towerName, flatNumber';

    const [rows] = await socPool.execute(query, queryParams);
    return jsonResponse(rows);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function POST(request, { params }) {
  try {
    const { id: societyId } = await params;
    const socPool = getSocietyPool(societyId);
    const body = await request.json();
    const id = uuidv4();

    await socPool.execute(
      'INSERT INTO flats (id, towerId, towerName, flatNumber, floor, type, area, ownerName, ownerPhone, ownerEmail, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.towerId || null, body.towerName || '', body.flatNumber || '', Number(body.floor) || 0, body.type || '2BHK', body.area || '', body.ownerName || '', body.ownerPhone || '', body.ownerEmail || '', body.status || 'vacant']
    );

    await initMasterDB();
    const masterPool = getMasterPool();
    const [flatCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM flats');
    await masterPool.execute('UPDATE societies SET totalFlats = ? WHERE id = ?', [flatCount[0].cnt, societyId]);

    const [rows] = await socPool.execute('SELECT * FROM flats WHERE id = ?', [id]);
    return jsonResponse(rows[0]);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
