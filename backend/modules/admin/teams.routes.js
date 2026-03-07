import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../../config/database.js';
import { parseJSON, buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/teams
router.get('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    let q = 'SELECT * FROM teams WHERE 1=1';
    const p = [];
    if (req.query.search) {
      q += ' AND (name LIKE ? OR description LIKE ?)';
      const s = `%${req.query.search}%`; p.push(s, s);
    }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.societyId) { q += ' AND societyId=?'; p.push(req.query.societyId); }
    q += ' ORDER BY createdAt DESC';
    const [teams] = await pool.execute(q, p);
    const [members] = await pool.execute('SELECT * FROM team_members');
    res.json(teams.map(t => ({
      ...t,
      permissions: parseJSON(t.permissions),
      members: members.filter(m => m.teamId === t.id).map(m => m.userId),
    })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/admin/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT * FROM teams WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found' });
    const t = rows[0]; t.permissions = parseJSON(t.permissions);
    const [members] = await pool.execute('SELECT * FROM team_members WHERE teamId=?', [req.params.id]);
    t.members = members.map(m => m.userId);
    // Get member details
    if (members.length) {
      const ids = members.map(m => m.userId);
      const placeholders = ids.map(() => '?').join(',');
      const [users] = await pool.execute(`SELECT id,name,userId,email,role FROM users WHERE id IN (${placeholders})`, ids);
      t.memberDetails = users;
    } else {
      t.memberDetails = [];
    }
    res.json(t);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/teams
router.post('/', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO teams (id,societyId,name,description,permissions,status) VALUES (?,?,?,?,?,?)',
      [id, b.societyId||null, b.name||'', b.description||'', JSON.stringify(b.permissions||[]), b.status||'active']);
    const [rows] = await pool.execute('SELECT * FROM teams WHERE id=?', [id]);
    const t = rows[0]; t.permissions = parseJSON(t.permissions); t.members = [];
    res.json(t);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/teams/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','description','societyId','status']);
    if (b.permissions !== undefined) { fields.push('permissions=?'); values.push(JSON.stringify(b.permissions)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE teams SET ${fields.join(',')} WHERE id=?`, values); }
    const [rows] = await pool.execute('SELECT * FROM teams WHERE id=?', [req.params.id]);
    const t = rows[0]; if (t) t.permissions = parseJSON(t.permissions);
    res.json(t || { message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/teams/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('DELETE FROM team_members WHERE teamId=?', [req.params.id]);
    await pool.execute('DELETE FROM teams WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/teams/:id/members
router.post('/:id/members', async (req, res) => {
  try {
    const pool = getMasterPool(); const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const [existing] = await pool.execute('SELECT id FROM team_members WHERE teamId=? AND userId=?', [req.params.id, userId]);
    if (existing.length) return res.status(400).json({ error: 'Already in team' });
    await pool.execute('INSERT INTO team_members (id,teamId,userId) VALUES (?,?,?)', [uuidv4(), req.params.id, userId]);
    res.json({ message: 'Member added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/teams/:id/members/:userId
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('DELETE FROM team_members WHERE teamId=? AND userId=?', [req.params.id, req.params.userId]);
    res.json({ message: 'Member removed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
