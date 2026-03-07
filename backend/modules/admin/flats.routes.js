import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/societies/:id/flats
router.get('/:id/flats', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    let q = 'SELECT * FROM flats WHERE 1=1'; const p = [];
    if (req.query.towerId) { q += ' AND towerId=?'; p.push(req.query.towerId); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    if (req.query.search) {
      q += ' AND (flatNumber LIKE ? OR ownerName LIKE ? OR towerName LIKE ?)';
      p.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }
    q += ' ORDER BY towerName,flatNumber';
    const [rows] = await socPool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/societies/:id/flats
router.post('/:id/flats', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const b = req.body; const id = uuidv4();
    await socPool.execute('INSERT INTO flats (id,towerId,towerName,flatNumber,floor,type,area,ownerName,ownerPhone,ownerEmail,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.towerId||null, b.towerName||'', b.flatNumber||'', Number(b.floor)||0, b.type||'2BHK', b.area||'', b.ownerName||'', b.ownerPhone||'', b.ownerEmail||'', b.status||'vacant']);
    const masterPool = getMasterPool();
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalFlats=? WHERE id=?', [fc[0].c, req.params.id]);
    const [row] = await socPool.execute('SELECT * FROM flats WHERE id=?', [id]);
    res.json(row[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/societies/:id/flats/:flatId
router.put('/:id/flats/:flatId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const { fields, values } = buildUpdateQuery(req.body, ['towerId','towerName','flatNumber','floor','type','area','ownerName','ownerPhone','ownerEmail','status']);
    if (fields.length) { values.push(req.params.flatId); await socPool.execute(`UPDATE flats SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.flatId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/societies/:id/flats/:flatId
router.delete('/:id/flats/:flatId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    await socPool.execute('DELETE FROM flats WHERE id=?', [req.params.flatId]);
    const masterPool = getMasterPool();
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalFlats=? WHERE id=?', [fc[0].c, req.params.id]);
    res.json({ message: 'Deleted', id: req.params.flatId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
