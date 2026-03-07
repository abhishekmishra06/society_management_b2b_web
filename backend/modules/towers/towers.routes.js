import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/towers
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [towers] = await pool.execute('SELECT * FROM towers ORDER BY name');
    const [flats] = await pool.execute('SELECT * FROM flats');
    res.json(towers.map(t => ({
      ...t,
      flatCount: flats.filter(f => f.towerId === t.id).length,
      occupiedCount: flats.filter(f => f.towerId === t.id && f.status === 'occupied').length,
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/towers/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM towers WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const [flats] = await pool.execute('SELECT * FROM flats WHERE towerId=?', [req.params.id]);
    res.json({ ...rows[0], flats, flatCount: flats.length, occupiedCount: flats.filter(f => f.status === 'occupied').length });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/towers
router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body;
    const id = uuidv4();
    await pool.execute('INSERT INTO towers (id,name,totalFloors,flatsPerFloor,description,status) VALUES (?,?,?,?,?,?)',
      [id, b.name||'', Number(b.totalFloors)||0, Number(b.flatsPerFloor)||0, b.description||'', b.status||'active']);

    // Auto-generate flats
    const totalFloors = Number(b.totalFloors) || 0;
    const flatsPerFloor = Number(b.flatsPerFloor) || 0;
    if (totalFloors > 0 && flatsPerFloor > 0) {
      for (let fl = 1; fl <= totalFloors; fl++) {
        for (let fn = 1; fn <= flatsPerFloor; fn++) {
          await pool.execute('INSERT INTO flats (id,towerId,towerName,flatNumber,floor,type,status) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), id, b.name||'', `${fl}${String(fn).padStart(2, '0')}`, fl, '2BHK', 'vacant']);
        }
      }
    }

    const [row] = await pool.execute('SELECT * FROM towers WHERE id=?', [id]);
    res.json(row[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/towers/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name', 'totalFloors', 'flatsPerFloor', 'description', 'status']);
    if (fields.length) {
      values.push(req.params.id);
      await pool.execute(`UPDATE towers SET ${fields.join(',')} WHERE id=?`, values);
    }
    if (req.body.name) {
      await pool.execute('UPDATE flats SET towerName=? WHERE towerId=?', [req.body.name, req.params.id]);
    }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/towers/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM flats WHERE towerId=?', [req.params.id]);
    await pool.execute('DELETE FROM towers WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
