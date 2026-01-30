const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/config');
const { admin_verify } = require('../auth/verify');

const joi = require('joi');

const vendorSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  phone: joi.string().allow(''),
  address: joi.string().allow(''),
  points_per_dollar: joi.number().min(0).default(1)
});

// Dashboard stats
router.get('/api/admin/dashboard', admin_verify, (req, res) => {
  try {
    const vendorCount = db.prepare('SELECT COUNT(*) as c FROM vendors WHERE is_active = 1').get().c;
    const customerCount = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const txToday = db.prepare('SELECT COUNT(*) as c, COALESCE(SUM(points), 0) as total FROM transactions WHERE timestamp >= ? AND type IN (\'earned\', \'shared_earned\')').get(todayStart);
    res.status(200).json({
      success: true,
      stats: {
        vendors: vendorCount,
        customers: customerCount,
        transactionsToday: txToday.c,
        pointsAwardedToday: txToday.total || 0
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List vendors
router.get('/api/admin/vendors', admin_verify, (req, res) => {
  try {
    const vendors = db.prepare('SELECT id, name, email, phone, address, points_per_dollar, is_active, created_at FROM vendors ORDER BY name').all();
    res.status(200).json({ success: true, data: vendors });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create vendor
router.post('/api/admin/vendors', admin_verify, (req, res) => {
  try {
    vendorSchema.validateAsync(req.body)
      .then((val) => {
        const existing = db.prepare('SELECT id FROM vendors WHERE email = ?').get(val.email);
        if (existing) {
          res.status(401).json({ success: false, msg: 'Email already registered' });
          return;
        }
        const id = uuidv4();
        const hash = bcrypt.hashSync(val.password, 10);
        db.prepare(`
          INSERT INTO vendors (id, name, email, password, phone, address, points_per_dollar, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        `).run(id, val.name, val.email, hash, val.phone || '', val.address || '', val.points_per_dollar || 1, Date.now());
        const vendor = db.prepare('SELECT id, name, email, phone, address, points_per_dollar, is_active, created_at FROM vendors WHERE id = ?').get(id);
        res.status(200).json({ success: true, vendor });
      })
      .catch((err) => res.status(400).json({ success: false, error: err.message }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get vendor
router.get('/api/admin/vendors/:id', admin_verify, (req, res) => {
  try {
    const vendor = db.prepare('SELECT id, name, email, phone, address, points_per_dollar, is_active, created_at FROM vendors WHERE id = ?').get(req.params.id);
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update vendor
router.put('/api/admin/vendors/:id', admin_verify, (req, res) => {
  try {
    const { name, phone, address, points_per_dollar, is_active } = req.body;
    const id = req.params.id;
    const existing = db.prepare('SELECT id FROM vendors WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    db.prepare(`
      UPDATE vendors SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address),
        points_per_dollar = COALESCE(?, points_per_dollar), is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name ?? undefined, phone ?? undefined, address ?? undefined, points_per_dollar ?? undefined, is_active ?? undefined, id);
    const vendor = db.prepare('SELECT id, name, email, phone, address, points_per_dollar, is_active, created_at FROM vendors WHERE id = ?').get(id);
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List customers
router.get('/api/admin/customers', admin_verify, (req, res) => {
  try {
    const customers = db.prepare('SELECT id, phone, fullname, email, created_at FROM customers ORDER BY created_at DESC').all();
    res.status(200).json({ success: true, data: customers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List all transactions
router.get('/api/admin/transactions', admin_verify, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    const rows = db.prepare(`
      SELECT t.id, t.customer_id, t.vendor_id, t.type, t.points, t.amount, t.processed_by, t.timestamp,
        c.phone as customer_phone, c.fullname as customer_name,
        v.name as vendor_name
      FROM transactions t
      LEFT JOIN customers c ON c.id = t.customer_id
      LEFT JOIN vendors v ON v.id = t.vendor_id
      ORDER BY t.timestamp DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
    res.status(200).json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get settings
router.get('/api/admin/settings', admin_verify, (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.status(200).json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update settings
router.put('/api/admin/settings', admin_verify, (req, res) => {
  try {
    const { shared_rewards_pct } = req.body;
    if (shared_rewards_pct != null) {
      const pct = Math.max(0, Math.min(100, parseFloat(shared_rewards_pct)));
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('shared_rewards_pct', String(pct));
    }
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.status(200).json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
