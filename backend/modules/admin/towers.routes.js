import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/societies/:id/towers
router.get('/:id/towers', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
    const [flats] = await socPool.execute('SELECT * FROM flats');
    res.json(towers.map(t => ({
      ...t,
      flatCount: flats.filter(f => f.towerId === t.id).length,
      occupiedCount: flats.filter(f => f.towerId === t.id && f.status === 'occupied').length,
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/societies/:id/towers
router.post('/:id/towers', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const b = req.body; const towerId = uuidv4();
    await socPool.execute('INSERT INTO towers (id,name,totalFloors,flatsPerFloor,description,status) VALUES (?,?,?,?,?,?)',
      [towerId, b.name||'', Number(b.totalFloors)||0, Number(b.flatsPerFloor)||0, b.description||'', b.status||'active']);

    const totalFloors = Number(b.totalFloors) || 0;
    const flatsPerFloor = Number(b.flatsPerFloor) || 0;
    if (totalFloors > 0 && flatsPerFloor > 0) {
      for (let fl = 1; fl <= totalFloors; fl++) {
        for (let fn = 1; fn <= flatsPerFloor; fn++) {
          await socPool.execute('INSERT INTO flats (id,towerId,towerName,flatNumber,floor,type,status) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), towerId, b.name||'', `${fl}${String(fn).padStart(2, '0')}`, fl, '2BHK', 'vacant']);
        }
      }
    }

    // Update counts in master
    const masterPool = getMasterPool();
    const [tc] = await socPool.execute('SELECT COUNT(*) as c FROM towers');
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalTowers=?,totalFlats=? WHERE id=?', [tc[0].c, fc[0].c, req.params.id]);

    const [row] = await socPool.execute('SELECT * FROM towers WHERE id=?', [towerId]);
    res.json(row[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/societies/:id/towers/:towerId
router.put('/:id/towers/:towerId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const { fields, values } = buildUpdateQuery(req.body, ['name','totalFloors','flatsPerFloor','description','status']);
    if (fields.length) { values.push(req.params.towerId); await socPool.execute(`UPDATE towers SET ${fields.join(',')} WHERE id=?`, values); }
    if (req.body.name) await socPool.execute('UPDATE flats SET towerName=? WHERE towerId=?', [req.body.name, req.params.towerId]);
    res.json({ message: 'Updated', id: req.params.towerId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/societies/:id/towers/:towerId
router.delete('/:id/towers/:towerId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    await socPool.execute('DELETE FROM flats WHERE towerId=?', [req.params.towerId]);
    await socPool.execute('DELETE FROM towers WHERE id=?', [req.params.towerId]);
    const masterPool = getMasterPool();
    const [tc] = await socPool.execute('SELECT COUNT(*) as c FROM towers');
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalTowers=?,totalFlats=? WHERE id=?', [tc[0].c, fc[0].c, req.params.id]);
    res.json({ message: 'Deleted', id: req.params.towerId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
