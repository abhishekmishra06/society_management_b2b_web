import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, initMasterDB, createSocietyDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET() {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT * FROM societies ORDER BY createdAt DESC');
    return jsonResponse(rows.map(r => ({ ...r, amenities: r.amenities ? (typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities) : [] })));
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function POST(request) {
  try {
    await initMasterDB();
    const pool = getMasterPool();
    const body = await request.json();
    const id = uuidv4();

    // Create the society-specific database
    const dbName = await createSocietyDB(id);

    await pool.execute(
      `INSERT INTO societies (id, name, address, city, state, pincode, phone, email, registrationNo, totalTowers, totalFlats, societyType, description, establishedYear, builderName, amenities, billingPeriod, maintenanceAmount, status, dbName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, body.name || '', body.address || '', body.city || '', body.state || '',
        body.pincode || '', body.phone || '', body.email || '', body.registrationNo || '',
        Number(body.totalTowers) || 0, Number(body.totalFlats) || 0,
        body.societyType || 'residential', body.description || '',
        body.establishedYear || '', body.builderName || '',
        JSON.stringify(body.amenities || []), body.billingPeriod || 'monthly',
        body.maintenanceAmount || '', body.status || 'active', dbName
      ]
    );

    const [rows] = await pool.execute('SELECT * FROM societies WHERE id = ?', [id]);
    const soc = rows[0];
    soc.amenities = soc.amenities ? (typeof soc.amenities === 'string' ? JSON.parse(soc.amenities) : soc.amenities) : [];
    return jsonResponse(soc);
  } catch (error) {
    console.error('Create society error:', error);
    return errorResponse('Server error: ' + error.message);
  }
}
