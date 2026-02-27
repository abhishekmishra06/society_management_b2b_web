import { getSocietyPool, getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function PUT(request, { params }) {
  try {
    const { id: societyId, flatId } = await params;
    const socPool = getSocietyPool(societyId);
    const body = await request.json();

    const fields = [];
    const values = [];
    ['towerId', 'towerName', 'flatNumber', 'floor', 'type', 'area', 'ownerName', 'ownerPhone', 'ownerEmail', 'status'].forEach(key => {
      if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(body[key]); }
    });

    if (fields.length > 0) {
      values.push(flatId);
      await socPool.execute(`UPDATE flats SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return jsonResponse({ message: 'Flat updated', id: flatId });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: societyId, flatId } = await params;
    const socPool = getSocietyPool(societyId);

    await socPool.execute('DELETE FROM flats WHERE id = ?', [flatId]);

    await initMasterDB();
    const masterPool = getMasterPool();
    const [flatCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM flats');
    await masterPool.execute('UPDATE societies SET totalFlats = ? WHERE id = ?', [flatCount[0].cnt, societyId]);

    return jsonResponse({ message: 'Flat deleted', id: flatId });
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
