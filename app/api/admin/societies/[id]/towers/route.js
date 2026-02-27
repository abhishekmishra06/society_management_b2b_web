import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool, getMasterPool, initMasterDB } from '@/lib/mysql';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-helpers';

export async function OPTIONS() { return optionsResponse(); }

export async function GET(request, { params }) {
  try {
    const { id: societyId } = await params;
    const socPool = getSocietyPool(societyId);
    const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
    const [flats] = await socPool.execute('SELECT * FROM flats');

    return jsonResponse(towers.map(t => ({
      ...t,
      flatCount: flats.filter(f => f.towerId === t.id).length,
      occupiedCount: flats.filter(f => f.towerId === t.id && f.status === 'occupied').length,
    })));
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}

export async function POST(request, { params }) {
  try {
    const { id: societyId } = await params;
    const socPool = getSocietyPool(societyId);
    const body = await request.json();
    const towerId = uuidv4();

    await socPool.execute(
      'INSERT INTO towers (id, name, totalFloors, flatsPerFloor, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [towerId, body.name || '', Number(body.totalFloors) || 0, Number(body.flatsPerFloor) || 0, body.description || '', body.status || 'active']
    );

    // Auto-generate flats
    const totalFloors = Number(body.totalFloors) || 0;
    const flatsPerFloor = Number(body.flatsPerFloor) || 0;
    if (totalFloors > 0 && flatsPerFloor > 0) {
      for (let floor = 1; floor <= totalFloors; floor++) {
        for (let flatNum = 1; flatNum <= flatsPerFloor; flatNum++) {
          await socPool.execute(
            'INSERT INTO flats (id, towerId, towerName, flatNumber, floor, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), towerId, body.name || '', `${floor}${String(flatNum).padStart(2, '0')}`, floor, '2BHK', 'vacant']
          );
        }
      }
    }

    // Update master DB counts
    await initMasterDB();
    const masterPool = getMasterPool();
    const [towerCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM towers');
    const [flatCount] = await socPool.execute('SELECT COUNT(*) as cnt FROM flats');
    await masterPool.execute('UPDATE societies SET totalTowers = ?, totalFlats = ? WHERE id = ?', [towerCount[0].cnt, flatCount[0].cnt, societyId]);

    const [tower] = await socPool.execute('SELECT * FROM towers WHERE id = ?', [towerId]);
    return jsonResponse(tower[0]);
  } catch (error) {
    return errorResponse('Server error: ' + error.message);
  }
}
