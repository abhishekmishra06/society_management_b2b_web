import { getMasterPool, initMasterDB, getSocietyPool, dropSocietyDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

// GET society profile with towers, flats, stats
export async function GET(request, { params }) {
  try {
    await initMasterDB();
    const { id } = await params;
    const pool = getMasterPool();
    const url = new URL(request.url);
    const profile = url.searchParams.get('profile');

    const [rows] = await pool.execute('SELECT * FROM societies WHERE id = ?', [id]);
    if (rows.length === 0) return errorResponse('Society not found', 404);
    const society = rows[0];
    society.amenities = society.amenities ? (typeof society.amenities === 'string' ? JSON.parse(society.amenities) : society.amenities) : [];

    if (profile === 'full') {
      try {
        const socPool = getSocietyPool(id);
        const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        const [flats] = await socPool.execute('SELECT * FROM flats ORDER BY towerName, flatNumber');
        const [residents] = await socPool.execute('SELECT * FROM residents');

        const totalFlats = flats.length;
        const occupiedFlats = flats.filter(f => f.status === 'occupied').length;
        const vacantFlats = flats.filter(f => f.status === 'vacant').length;

        return jsonResponse({
          ...society,
          towers: towers.map(t => ({
            ...t,
            flatCount: flats.filter(f => f.towerId === t.id).length,
            occupiedCount: flats.filter(f => f.towerId === t.id && f.status === 'occupied').length,
          })),
          flats,
          residents,
          stats: {
            totalTowers: towers.length,
            totalFlats,
            occupiedFlats,
            vacantFlats,
            occupancyRate: totalFlats > 0 ? Math.round((occupiedFlats / totalFlats) * 100) : 0,
            totalResidents: residents.length,
          },
        });
      } catch (e) {
        return jsonResponse({ ...society, towers: [], flats: [], residents: [], stats: { totalTowers: 0, totalFlats: 0, occupiedFlats: 0, vacantFlats: 0, occupancyRate: 0, totalResidents: 0 } });
      }
    }

    return jsonResponse(society);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

// PUT update society
export async function PUT(request, { params }) {
  try {
    await initMasterDB();
    const { id } = await params;
    const pool = getMasterPool();
    const body = await request.json();

    const fields = [];
    const values = [];
    const allowedFields = ['name','address','city','state','pincode','phone','email','registrationNo','totalTowers','totalFlats','societyType','description','establishedYear','builderName','billingPeriod','maintenanceAmount','status'];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    if (body.amenities !== undefined) {
      fields.push('amenities = ?');
      values.push(JSON.stringify(body.amenities));
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE societies SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return jsonResponse({ message: 'Society updated', id });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

// DELETE society and its database
export async function DELETE(request, { params }) {
  try {
    await initMasterDB();
    const { id } = await params;
    const pool = getMasterPool();

    await dropSocietyDB(id);
    await pool.execute('DELETE FROM societies WHERE id = ?', [id]);

    return jsonResponse({ message: 'Society and database deleted', id });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
