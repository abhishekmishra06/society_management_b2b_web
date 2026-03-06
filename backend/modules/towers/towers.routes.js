import { getSocietyPool } from '../../config/database.js';
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM towers ORDER BY name');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
