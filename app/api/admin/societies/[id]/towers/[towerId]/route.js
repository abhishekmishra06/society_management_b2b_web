import { getSocietyPool, getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function PUT(request, { params }) {
  try {
    const { id: societyId, towerId } = await params;
    const socPool = getSocietyPool(societyId);
    const body = await request.json();

    const fields = [];
    const values = [];
    ['name', 'totalFloors', 'flatsPerFloor', 'description', 'status'].forEach(key => {
      if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]); }
    });

    if (fields.length > 0) {
      values.push(towerId);
      await socPool.execute(`UPDATE towers SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    if (body.name) {
      await socPool.execute('UPDATE flats SET towerName = ? WHERE towerId = ?', [body.name, towerId]);
    }

    return jsonResponse({ message: 'Tower updated', id: towerId });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: societyId, towerId } = await params;
    const socPool = getSocietyPool(societyId);

    await socPool.execute('DELETE FROM flats WHERE towerId = ?', [towerId]);
    await socPool.execute('DELETE FROM towers WHERE id = ?', [towerId]);

    await initMasterDB();
    const masterPool = getMasterPool();
    const [towerCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM towers');
    const [flatCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM flats');
    await masterPool.execute('UPDATE societies SET totalTowers = ?, totalFlats = ? WHERE id = ?', [towerCount[0].cnt, flatCount[0].cnt, societyId]);

    return jsonResponse({ message: 'Tower and flats deleted', id: towerId });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
