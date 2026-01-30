const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../database/config');
const { verify } = require('../auth/verify');

// Customer balances: per-vendor points + shared pool
router.get('/api/customer/balances', verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.TOKEN || 'user-secret');
    const customerId = decoded.id;
    const balances = db.prepare(`
      SELECT b.vendor_id, b.points, v.name as vendor_name
      FROM balances b
      JOIN vendors v ON v.id = b.vendor_id AND v.is_active = 1
      WHERE b.customer_id = ? AND b.points > 0
      ORDER BY b.points DESC
    `).all(customerId);
    const shared = db.prepare('SELECT points FROM shared_pool WHERE customer_id = ?').get(customerId);
    res.status(200).json({
      success: true,
      vendorBalances: balances,
      sharedPoints: shared ? shared.points : 0
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Customer transaction history
router.get('/api/customer/transactions', verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.TOKEN || 'user-secret');
    const customerId = decoded.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const rows = db.prepare(`
      SELECT t.id, t.type, t.points, t.amount, t.timestamp, v.name as vendor_name
      FROM transactions t
      LEFT JOIN vendors v ON v.id = t.vendor_id
      WHERE t.customer_id = ? ORDER BY t.timestamp DESC LIMIT ? OFFSET ?
    `).all(customerId, limit, offset);
    res.status(200).json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get customer profile
router.get('/api/customer/me', verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.TOKEN || 'user-secret');
    const customer = db.prepare('SELECT id, phone, fullname, email, created_at FROM customers WHERE id = ?').get(decoded.id);
    if (!customer) {
      res.status(404).json({ success: false, msg: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, customer });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
