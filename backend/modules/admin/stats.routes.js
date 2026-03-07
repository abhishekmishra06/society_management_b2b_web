import { Router } from 'express';
import { getMasterPool } from '../../config/database.js';

const router = Router();

// GET /api/admin/stats
router.get('/', async (req, res) => {
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

export default router;
