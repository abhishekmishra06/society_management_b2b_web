import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMasterPool, getSocietyPool, dropSocietyDB } from '../../config/database.js';
import { createSocietyDB } from '../../models/societySchema.js';
import { parseJSON, buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// GET /api/admin/societies
router.get('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    let q = 'SELECT * FROM societies WHERE 1=1';
    const p = [];
    if (req.query.search) {
      q += ' AND (name LIKE ? OR city LIKE ? OR registrationNo LIKE ? OR email LIKE ?)';
      const s = `%${req.query.search}%`; p.push(s, s, s, s);
    }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.city) { q += ' AND city=?'; p.push(req.query.city); }
    if (req.query.societyType) { q += ' AND societyType=?'; p.push(req.query.societyType); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows.map(r => ({ ...r, amenities: parseJSON(r.amenities) })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/admin/societies
router.post('/', async (req, res) => {
  try {
    const pool = getMasterPool();
    const b = req.body; const id = uuidv4();
    const dbName = await createSocietyDB(id);
    await pool.execute(
      'INSERT INTO societies (id,name,address,city,state,pincode,phone,email,registrationNo,totalTowers,totalFlats,societyType,description,establishedYear,builderName,amenities,billingPeriod,maintenanceAmount,status,dbName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.address||'', b.city||'', b.state||'', b.pincode||'', b.phone||'', b.email||'', b.registrationNo||'', Number(b.totalTowers)||0, Number(b.totalFlats)||0, b.societyType||'residential', b.description||'', b.establishedYear||'', b.builderName||'', JSON.stringify(b.amenities||[]), b.billingPeriod||'monthly', b.maintenanceAmount||'', b.status||'active', dbName]
    );

    // Auto-create SOCIETY_ADMIN user for this society
    const adminUserId = uuidv4();
    const societyAdminId = b.adminUserId || `society_${id.substring(0,8)}`;
    const societyAdminPassword = b.adminPassword || 'password123';
    const societyAdminName = b.adminName || `${b.name} Admin`;
    await pool.execute(
      'INSERT INTO users (id,name,userId,password,email,phone,role,societyId,permissions) VALUES (?,?,?,?,?,?,?,?,?)',
      [adminUserId, societyAdminName, societyAdminId, societyAdminPassword, b.email||'', b.phone||'', 'SOCIETY_ADMIN', id, JSON.stringify(['FULL_ACCESS'])]
    );

    const [rows] = await pool.execute('SELECT * FROM societies WHERE id=?', [id]);
    const soc = rows[0]; soc.amenities = parseJSON(soc.amenities);
    soc.adminCredentials = { userId: societyAdminId, password: societyAdminPassword, name: societyAdminName };
    res.json(soc);
  } catch (error) { console.error('[Admin:Societies]', error); res.status(500).json({ error: error.message }); }
});

// GET /api/admin/societies/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const [rows] = await pool.execute('SELECT * FROM societies WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const soc = rows[0]; soc.amenities = parseJSON(soc.amenities);

    // Fetch admin user for this society
    const [admins] = await pool.execute('SELECT id,name,userId,email,phone,role FROM users WHERE societyId=? AND role="SOCIETY_ADMIN"', [req.params.id]);
    soc.adminUser = admins[0] || null;

    if (req.query.profile === 'full') {
      try {
        const socPool = getSocietyPool(req.params.id);
        const [towers] = await socPool.execute('SELECT * FROM towers ORDER BY name');
        const [flats] = await socPool.execute('SELECT * FROM flats ORDER BY towerName,flatNumber');
        const [residents] = await socPool.execute('SELECT * FROM residents');
        const [complaints] = await socPool.execute('SELECT COUNT(*) as c FROM complaints');
        const [visitors] = await socPool.execute('SELECT COUNT(*) as c FROM visitors');
        const [staff] = await socPool.execute('SELECT COUNT(*) as c FROM staff');
        const totalFlats = flats.length;
        const occupiedFlats = flats.filter(f => f.status==='occupied').length;
        const vacantFlats = flats.filter(f => f.status==='vacant').length;
        return res.json({ ...soc,
          towers: towers.map(t => ({ ...t, flatCount: flats.filter(f=>f.towerId===t.id).length, occupiedCount: flats.filter(f=>f.towerId===t.id&&f.status==='occupied').length })),
          flats, residents,
          stats: {
            totalTowers: towers.length, totalFlats, occupiedFlats, vacantFlats,
            occupancyRate: totalFlats>0?Math.round((occupiedFlats/totalFlats)*100):0,
            totalResidents: residents.length,
            totalComplaints: complaints[0].c,
            totalVisitors: visitors[0].c,
            totalStaff: staff[0].c,
          }
        });
      } catch(e) {
        return res.json({ ...soc, towers:[], flats:[], residents:[], stats:{totalTowers:0,totalFlats:0,occupiedFlats:0,vacantFlats:0,occupancyRate:0,totalResidents:0,totalComplaints:0,totalVisitors:0,totalStaff:0} });
      }
    }
    res.json(soc);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/admin/societies/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    const b = req.body;
    const { fields, values } = buildUpdateQuery(b, ['name','address','city','state','pincode','phone','email','registrationNo','totalTowers','totalFlats','societyType','description','establishedYear','builderName','billingPeriod','maintenanceAmount','status']);
    if (b.amenities !== undefined) { fields.push('amenities=?'); values.push(JSON.stringify(b.amenities)); }
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE societies SET ${fields.join(',')} WHERE id=?`, values); }
    const [rows] = await pool.execute('SELECT * FROM societies WHERE id=?', [req.params.id]);
    const soc = rows[0]; if (soc) soc.amenities = parseJSON(soc.amenities);
    res.json(soc || { message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE /api/admin/societies/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = getMasterPool();
    // Delete associated users
    await pool.execute('DELETE FROM users WHERE societyId=?', [req.params.id]);
    // Drop society DB
    await dropSocietyDB(req.params.id);
    await pool.execute('DELETE FROM societies WHERE id=?', [req.params.id]);
    res.json({ message: 'Society, database, and associated users deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
