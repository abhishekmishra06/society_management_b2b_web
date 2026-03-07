import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// Vendor Contracts - MUST be before /:id
router.get('/contracts', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM vendor_contracts ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/contracts', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO vendor_contracts (id,vendorId,vendorName,title,startDate,endDate,amount,status,description) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.vendorId||null, b.vendorName||'', b.title||'', b.startDate||null, b.endDate||null, Number(b.amount)||0, b.status||'active', b.description||'']);
    const [rows] = await pool.execute('SELECT * FROM vendor_contracts WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/contracts/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['vendorId','vendorName','title','startDate','endDate','amount','status','description']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE vendor_contracts SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/contracts/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM vendor_contracts WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Vendor Payments - MUST be before /:id
router.get('/payments', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM vendor_payments ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/payments', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO vendor_payments (id,vendorId,vendorName,amount,paymentDate,method,status,receiptNo,description) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.vendorId||null, b.vendorName||'', Number(b.amount)||0, b.paymentDate||null, b.method||'bank_transfer', b.status||'pending', b.receiptNo||'', b.description||'']);
    const [rows] = await pool.execute('SELECT * FROM vendor_payments WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Vendors CRUD
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM vendors WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (name LIKE ? OR company LIKE ? OR service LIKE ? OR phone LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM vendors WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute('INSERT INTO vendors (id,name,company,service,phone,email,status,address) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.name||'', b.company||'', b.service||'', b.phone||'', b.email||'', b.status||'active', b.address||'']);
    const [rows] = await pool.execute('SELECT * FROM vendors WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['name','company','service','phone','email','status','address']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE vendors SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM vendors WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
