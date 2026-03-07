import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSocietyPool } from '../../config/database.js';
import { buildUpdateQuery } from '../../utils/helpers.js';

const router = Router();

// Sub-routes MUST be before /:id to avoid conflicts

// Maintenance bills
router.get('/maintenance', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM billing WHERE type="maintenance" ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/maintenance', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO billing (id,flatNumber,tower,residentName,amount,type,month,year,dueDate,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.flatNumber||'', b.tower||'', b.residentName||'', Number(b.amount)||0, 'maintenance', b.month||'', Number(b.year)||new Date().getFullYear(), b.dueDate||null, b.status||'pending']
    );
    const [rows] = await pool.execute('SELECT * FROM billing WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Utility bills
router.get('/utility', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM billing WHERE type IN ("water","electricity") ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/utility', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO billing (id,flatNumber,tower,residentName,amount,type,month,year,dueDate,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.flatNumber||'', b.tower||'', b.residentName||'', Number(b.amount)||0, b.type||'water', b.month||'', Number(b.year)||new Date().getFullYear(), b.dueDate||null, b.status||'pending']
    );
    const [rows] = await pool.execute('SELECT * FROM billing WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Payments
router.get('/payments', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM billing_payments ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/payments', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO billing_payments (id,billingId,flatNumber,amount,method,transactionId,receiptNo,status) VALUES (?,?,?,?,?,?,?,?)',
      [id, b.billingId||null, b.flatNumber||'', Number(b.amount)||0, b.method||'', b.transactionId||'', b.receiptNo||'', b.status||'success']
    );
    if (b.billingId) {
      await pool.execute('UPDATE billing SET status="paid", paidDate=CURDATE(), paidAmount=?, paymentMethod=?, receiptNo=? WHERE id=?',
        [Number(b.amount)||0, b.method||'', b.receiptNo||'', b.billingId]).catch(() => {});
    }
    const [rows] = await pool.execute('SELECT * FROM billing_payments WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Expenses
router.get('/expenses', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [rows] = await pool.execute('SELECT * FROM billing WHERE type IN ("penalty","other") ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/expenses', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO billing (id,flatNumber,tower,residentName,amount,type,month,year,dueDate,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, b.flatNumber||'', b.tower||'', b.residentName||b.description||'', Number(b.amount)||0, 'other', b.month||'', Number(b.year)||new Date().getFullYear(), b.dueDate||null, b.status||'paid']
    );
    const [rows] = await pool.execute('SELECT * FROM billing WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Ledger
router.get('/ledger', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [bills] = await pool.execute('SELECT * FROM billing ORDER BY createdAt DESC');
    const [payments] = await pool.execute('SELECT * FROM billing_payments ORDER BY createdAt DESC');
    res.json({ bills, payments });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/ledger', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const b = req.body; const id = uuidv4();
    await pool.execute(
      'INSERT INTO billing (id,flatNumber,tower,residentName,amount,type,month,year,status) VALUES (?,?,?,?,?,?,?,?,?)',
      [id, b.flatNumber||'', b.tower||'', b.description||b.residentName||'', Number(b.amount)||0, b.type||'other', b.month||'', Number(b.year)||new Date().getFullYear(), b.status||'pending']
    );
    const [rows] = await pool.execute('SELECT * FROM billing WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Reports
router.get('/reports', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const [totalBills] = await pool.execute('SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM billing');
    const [pendingBills] = await pool.execute('SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM billing WHERE status="pending"');
    const [paidBills] = await pool.execute('SELECT COUNT(*) as c, COALESCE(SUM(paidAmount),0) as total FROM billing WHERE status="paid"');
    const [overdueBills] = await pool.execute('SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM billing WHERE status="overdue"');
    res.json({
      total: { count: totalBills[0].c, amount: Number(totalBills[0].total) },
      pending: { count: pendingBills[0].c, amount: Number(pendingBills[0].total) },
      paid: { count: paidBills[0].c, amount: Number(paidBills[0].total) },
      overdue: { count: overdueBills[0].c, amount: Number(overdueBills[0].total) },
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/billing - all bills
router.get('/', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    let q = 'SELECT * FROM billing WHERE 1=1'; const p = [];
    if (req.query.search) { q += ' AND (flatNumber LIKE ? OR residentName LIKE ? OR tower LIKE ?)'; const s = `%${req.query.search}%`; p.push(s, s, s); }
    if (req.query.status) { q += ' AND status=?'; p.push(req.query.status); }
    if (req.query.type) { q += ' AND type=?'; p.push(req.query.type); }
    if (req.query.month) { q += ' AND month=?'; p.push(req.query.month); }
    if (req.query.year) { q += ' AND year=?'; p.push(req.query.year); }
    q += ' ORDER BY createdAt DESC';
    const [rows] = await pool.execute(q, p);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    const { fields, values } = buildUpdateQuery(req.body, ['flatNumber','tower','residentName','amount','type','month','year','dueDate','status','paidDate','paidAmount','paymentMethod','receiptNo']);
    if (fields.length) { values.push(req.params.id); await pool.execute(`UPDATE billing SET ${fields.join(',')} WHERE id=?`, values); }
    res.json({ message: 'Updated', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = getSocietyPool(req.societyId);
    await pool.execute('DELETE FROM billing WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
