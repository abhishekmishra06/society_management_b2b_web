import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../config/database.js';
import { buildUpdateQuery } from './helpers.js';

// Generic CRUD router factory for society-level modules
export function createCrudRouter(tableName, insertFields, updateFields, orderBy = 'createdAt DESC') {
  const router = Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const pool = getSocietyPool(req.societyId);
      const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` ORDER BY ${orderBy}`);
      res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const pool = getSocietyPool(req.societyId);
      const b = req.body; const id = uuidv4();
      const cols = ['id', ...insertFields];
      const vals = [id, ...insertFields.map(f => b[f] !== undefined ? b[f] : (f.includes('Date') ? null : ''))];
      const placeholders = cols.map(() => '?').join(',');
      await pool.execute(`INSERT INTO \`${tableName}\` (${cols.join(',')}) VALUES (${placeholders})`, vals);
      const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` WHERE id=?`, [id]);
      res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
  });

  // PUT update
  router.put('/', async (req, res) => {
    try {
      const pool = getSocietyPool(req.societyId);
      const b = req.body;
      if (!b.id) return res.status(400).json({ error: 'ID required' });
      const { fields, values } = buildUpdateQuery(b, updateFields);
      if (fields.length) { values.push(b.id); await pool.execute(`UPDATE \`${tableName}\` SET ${fields.join(',')} WHERE id=?`, values); }
      res.json({ message: 'Updated', id: b.id });
    } catch (error) { res.status(500).json({ error: error.message }); }
  });

  // DELETE
  router.delete('/', async (req, res) => {
    try {
      const pool = getSocietyPool(req.societyId);
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await pool.execute(`DELETE FROM \`${tableName}\` WHERE id=?`, [id]);
      res.json({ message: 'Deleted', id });
    } catch (error) { res.status(500).json({ error: error.message }); }
  });

  return router;
}
