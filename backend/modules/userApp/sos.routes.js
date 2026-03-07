import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';

const router = Router();

// POST /api/user/sos - Trigger SOS emergency
router.post('/', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const b = req.body; const id = uuidv4();

    await pool.execute(
      'INSERT INTO emergencies (id,type,description,reportedBy,flatNumber,status) VALUES (?,?,?,?,?,?)',
      [id, b.type || 'sos', b.description || 'Emergency SOS triggered!', req.user.name || b.reportedBy || '', b.flatNumber || '', 'active']
    );

    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE id=?', [id]);
    const emergency = rows[0];

    // Broadcast via WebSocket (io is attached to app)
    const io = req.app.get('io');
    if (io) {
      io.to(`society_${req.user.societyId}`).emit('sos_alert', {
        id: emergency.id,
        type: emergency.type,
        description: emergency.description,
        reportedBy: emergency.reportedBy,
        flatNumber: emergency.flatNumber,
        status: 'active',
        createdAt: emergency.createdAt,
        societyId: req.user.societyId,
      });
      console.log(`[SOS] Broadcasting to society_${req.user.societyId}`);
    }

    res.json(emergency);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/user/sos/active - Active SOS alerts
router.get('/active', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE status="active" ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/user/sos/:id/resolve
router.post('/:id/resolve', async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) return res.status(400).json({ error: 'No society linked' });
    const pool = getSocietyPool(req.user.societyId);
    await pool.execute('UPDATE emergencies SET status=?, resolvedAt=NOW(), resolvedBy=? WHERE id=?',
      ['resolved', req.user.name || req.body.resolvedBy || '', req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM emergencies WHERE id=?', [req.params.id]);

    // Broadcast resolution
    const io = req.app.get('io');
    if (io) {
      io.to(`society_${req.user.societyId}`).emit('sos_resolved', {
        id: req.params.id,
        resolvedBy: req.user.name || '',
        resolvedAt: new Date().toISOString(),
      });
    }

    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
