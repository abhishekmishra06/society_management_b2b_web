import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, getSocietyPool, dropSocietyDB } from '../../config/database.js';
import { createSocietyDB } from '../../models/societySchema.js';
import { parseJSON, buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [societies] = await pool.execute('SELECT * FROM societies');
    const [users] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,createdAt FROM users');
    const [teams] = await pool.execute('SELECT * FROM teams');
    const cities = [...new Set(societies.map(s => s.city).filter(Boolean))].sort();
    res.json({
      totalSocieties: societies.length, totalUsers: users.length, totalTeams: teams.length,
      activeSocieties: societies.filter(s => s.status==='active').length,
      inactiveSocieties: societies.filter(s => s.status==='inactive').length,
      adminUsers: users.filter(u => u.role==='SOCIETY_ADMIN').length,
      staffUsers: users.filter(u => u.role==='STAFF').length,
      superAdmins: users.filter(u => u.role==='SUPER_ADMIN').length,
      vendorUsers: users.filter(u => u.role==='VENDOR').length,
      residentUsers: users.filter(u => u.role==='RESIDENT').length,
      cities, recentSocieties: societies.slice(-5).reverse(),
      recentUsers: users.slice(-5).reverse(),
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/admin/societies
router.get('/societies', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT * FROM societies ORDER BY createdAt DESC');
    res.json(rows.map(r => ({ ...r, amenities: parseJSON(r.amenities) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/societies
router.post('/societies', async (req, res) => {
  try {
    const pool = getMasterPool();
    const b = req.body; const id = uuidv4();
    const dbName = await createSocietyDB(id);
    await pool.execute(
      'INSERT INTO societies (id,name,address,city,state,pincode,phone,email,registrationNo,totalTowers,totalFlats,societyType,description,establishedYear,builderName,amenities,billingPeriod,maintenanceAmount,status,dbName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.address||'', b.city||'', b.state||'', b.pincode||'', b.phone||'', b.email||'', b.registrationNo||'', Number(b.totalTowers)||0, Number(b.totalFlats)||0, b.societyType||'residential', b.description||'', b.establishedYear||'', b.builderName||'', JSON.stringify(b.amenities||[]), b.billingPeriod||'monthly', b.maintenanceAmount||'', b.status||'active', dbName]
    );
    const [rows] = await pool.execute('SELECT * FROM societies WHERE id=?', [id]);
    const soc = rows[0]; soc.amenities = parseJSON(soc.amenities);
    res.json(soc);
  } catch (error) { console.error('[Admin]', error); res.status(500).json({ error: error.message }); }
});

// GET /api/admin/societies/:id
router.get('/societies/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT * FROM societies WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const soc = rows[0]; soc.amenities = parseJSON(soc.amenities);

    if (req.query.profile === 'full') {
      try {
        const socPool = getSocietyPool(req.params.id);
        const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        const [flats] = await socPool.execute('SELECT * FROM flats ORDER BY towerName,flatNumber');
        const [residents] = await socPool.execute('SELECT * FROM residents');
        const totalFlats = flats.length;
        const occupiedFlats = flats.filter(f => f.status==='occupied').length;
        const vacantFlats = flats.filter(f => f.status==='vacant').length;
        return res.json({ ...soc,
          towers: towers.map(t => ({ ...t, flatCount: flats.filter(f=>f.towerId===t.id).length, occupiedCount: flats.filter(f=>f.towerId===t.id&&f.status==='occupied').length })),
          flats, residents,
          stats: { totalTowers: towers.length, totalFlats, occupiedFlats, vacantFlats, occupancyRate: totalFlats>0?Math.round((occupiedFlats/totalFlats)*100):0, totalResidents: residents.length }
        });
      } catch(e) {
        return res.json({ ...soc, towers:[], flats:[], residents:[], stats:{totalTowers:0,totalFlats:0,occupiedFlats:0,vacantFlats:0,occupancyRate:0,totalResidents:0} });
      }
    }
    res.json(soc);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/societies/:id
router.put('/societies/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','address','city','state','pincode','phone','email','registrationNo','totalTowers','totalFlats','societyType','description','establishedYear','builderName','billingPeriod','maintenanceAmount','status']);
    if (b.amenities !== undefined) { fields.push('amenities=?'); values.push(JSON.stringify(b.amenities)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE societies SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/societies/:id
router.delete('/societies/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    await dropSocietyDB(req.params.id);
    await pool.execute('DELETE FROM societies WHERE id=?', [req.params.id]);
    res.json({ message: 'Society and database deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- TOWERS ---
router.get('/societies/:id/towers', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
    const [flats] = await socPool.execute('SELECT * FROM flats');
    res.json(towers.map(t => ({ ...t, flatCount: flats.filter(f=>f.towerId===t.id).length, occupiedCount: flats.filter(f=>f.towerId===t.id&&f.status==='occupied').length })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/societies/:id/towers', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const b = req.body; const towerId = uuidv4();
    await socPool.execute('INSERT INTO towers (id,name,totalFloors,flatsPerFloor,description,status) VALUES (?,?,?,?,?,?)',
      [towerId, b.name||'', Number(b.totalFloors)||0, Number(b.flatsPerFloor)||0, b.description||'', b.status||'active']);

    const totalFloors = Number(b.totalFloors)||0;
    const flatsPerFloor = Number(b.flatsPerFloor)||0;
    if (totalFloors>0 && flatsPerFloor>0) {
      for (let fl=1; fl<=totalFloors; fl++) {
        for (let fn=1; fn<=flatsPerFloor; fn++) {
          await socPool.execute('INSERT INTO flats (id,towerId,towerName,flatNumber,floor,type,status) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), towerId, b.name||'', `${fl}${String(fn).padStart(2,'0')}`, fl, '2BHK', 'vacant']);
        }
      }
    }
    // Update counts
    const masterPool = getMasterPool();
    const [tc] = await socPool.execute('SELECT COUNT(*) as c FROM towers');
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalTowers=?,totalFlats=? WHERE id=?', [tc[0].c, fc[0].c, req.params.id]);

    const [row] = await socPool.execute('SELECT * FROM towers WHERE id=?', [towerId]);
    res.json(row[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/societies/:id/towers/:towerId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const { fields, values } = buildUpdateQuery(req.body, ['name','totalFloors','flatsPerFloor','description','status']);
    if (fields.length) { values.push(req.params.towerId); await socPool.execute(`UPDATE towers SET ${fields.join(',')} WHERE id=?`, values); }
    if (req.body.name) await socPool.execute('UPDATE flats SET towerName=? WHERE towerId=?', [req.body.name, req.params.towerId]);
    res.json({ message: 'Updated', id: req.params.towerId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/societies/:id/towers/:towerId', async (req, res) => {
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

// --- FLATS ---
router.get('/societies/:id/flats', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    let q = 'SELECT * FROM flats WHERE 1=1'; const p = [];
    if (req.query.towerId) { q+=' AND towerId=?'; p.push(req.query.towerId); }
    if (req.query.status) { q+=' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q+=' AND type=?'; p.push(req.query.type); }
    if (req.query.search) { q+=' AND (flatNumber LIKE ? OR ownerName LIKE ? OR towerName LIKE ?)'; p.push(`%${req.query.search}%`,`%${req.query.search}%`,`%${req.query.search}%`); }
    q+=' ORDER BY towerName,flatNumber';
    const [rows] = await socPool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/societies/:id/flats', async (req, res) => {
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

router.put('/societies/:id/flats/:flatId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    const { fields, values } = buildUpdateQuery(req.body, ['towerId','towerName','flatNumber','floor','type','area','ownerName','ownerPhone','ownerEmail','status']);
    if (fields.length) { values.push(req.params.flatId); await socPool.execute(`UPDATE flats SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.flatId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/societies/:id/flats/:flatId', async (req, res) => {
  try {
    const socPool = getSocietyPool(req.params.id);
    await socPool.execute('DELETE FROM flats WHERE id=?', [req.params.flatId]);
    const masterPool = getMasterPool();
    const [fc] = await socPool.execute('SELECT COUNT(*) as c FROM flats');
    await masterPool.execute('UPDATE societies SET totalFlats=? WHERE id=?', [fc[0].c, req.params.id]);
    res.json({ message: 'Deleted', id: req.params.flatId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,fcmToken,firstLogin,createdAt,updatedAt FROM users ORDER BY createdAt DESC');
    res.json(rows.map(r => ({ ...r, permissions: parseJSON(r.permissions) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/users', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE userId=?', [b.userId]);
    if (existing.length) return res.status(400).json({ error: 'User ID exists' });
    const id = uuidv4();
    await pool.execute('INSERT INTO users (id,name,userId,password,email,phone,role,societyId,permissions) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.userId, b.password||'password', b.email||'', b.phone||'', b.role||'STAFF', b.societyId||null, JSON.stringify(b.permissions||[])]);
    const [rows] = await pool.execute('SELECT id,name,userId,email,phone,role,societyId,permissions,createdAt FROM users WHERE id=?', [id]);
    const u = rows[0]; u.permissions = parseJSON(u.permissions);
    res.json(u);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','email','phone','role','societyId','fcmToken']);
    if (b.password) { fields.push('password=?'); values.push(b.password); }
    if (b.permissions !== undefined) { fields.push('permissions=?'); values.push(JSON.stringify(b.permissions)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- TEAMS ---
router.get('/teams', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [teams] = await pool.execute('SELECT * FROM teams ORDER BY createdAt DESC');
    const [members] = await pool.execute('SELECT * FROM team_members');
    res.json(teams.map(t => ({ ...t, permissions: parseJSON(t.permissions), members: members.filter(m=>m.teamId===t.id).map(m=>m.userId) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/teams', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO teams (id,societyId,name,description,permissions,status) VALUES (?,?,?,?,?,?)',
      [id, b.societyId||null, b.name||'', b.description||'', JSON.stringify(b.permissions||[]), b.status||'active']);
    const [rows] = await pool.execute('SELECT * FROM teams WHERE id=?', [id]);
    const t = rows[0]; t.permissions = parseJSON(t.permissions); t.members = [];
    res.json(t);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/teams/:id', async (req, res) => {
  try {
    const pool = getMasterPool(); const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','description','societyId','status']);
    if (b.permissions !== undefined) { fields.push('permissions=?'); values.push(JSON.stringify(b.permissions)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE teams SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/teams/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    await pool.execute('DELETE FROM team_members WHERE teamId=?', [req.params.id]);
    await pool.execute('DELETE FROM teams WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/teams/:id/members', async (req, res) => {
  try {
    const pool = getMasterPool(); const { userId } = req.body;
    const [existing] = await pool.execute('SELECT id FROM team_members WHERE teamId=? AND userId=?', [req.params.id, userId]);
    if (existing.length) return res.status(400).json({ error: 'Already in team' });
    await pool.execute('INSERT INTO team_members (id,teamId,userId) VALUES (?,?,?)', [uuidv4(), req.params.id, userId]);
    res.json({ message: 'Member added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
