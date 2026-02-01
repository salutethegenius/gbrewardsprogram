const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const { vendor_verify } = require('../auth/verify');
const { normalizePhoneForLookup } = require('../utilities/algorithmns');

const VENDOR_SECRET = process.env.VENDOR_TOKEN || 'vendor-secret';

// Public: add customer when they scan QR and submit (join page)
router.post('/api/join', (req, res) => {
  try {
    const { vendor_id, phone, fullname } = req.body || {};
    const phoneNorm = normalizePhoneForLookup((phone || '').toString().trim());
    if (phoneNorm.length < 6) {
      res.status(400).json({ success: false, msg: 'Valid phone number required' });
      return;
    }
    if (!vendor_id) {
      res.status(400).json({ success: false, msg: 'Vendor required' });
      return;
    }
    const vendor = db.prepare('SELECT id FROM vendors WHERE id = ? AND is_active = 1').get(vendor_id);
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    let customer = db.prepare('SELECT id, phone, fullname FROM customers WHERE phone = ?').get(phoneNorm);
    if (!customer) {
      const custId = uuidv4();
      db.prepare('INSERT INTO customers (id, phone, fullname, email, created_at) VALUES (?, ?, ?, ?, ?)').run(
        custId, phoneNorm, (fullname || '').trim() || null, '', Date.now()
      );
      db.prepare('INSERT OR IGNORE INTO shared_pool (customer_id, points) VALUES (?, 0)').run(custId);
      customer = { id: custId, phone: phoneNorm, fullname: (fullname || '').trim() || null };
    }
    db.prepare(`
      INSERT INTO balances (customer_id, vendor_id, points) VALUES (?, ?, 0)
      ON CONFLICT(customer_id, vendor_id) DO NOTHING
    `).run(customer.id, vendor_id);
    res.status(200).json({ success: true, customer: { id: customer.id, phone: customer.phone, fullname: customer.fullname } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Join URL for QR code (vendor shows QR; customer scans and gets this URL) (vendor shows QR; customer scans and gets this URL)
router.get('/api/vendor/join-info', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendor = db.prepare('SELECT id, name FROM vendors WHERE id = ? AND is_active = 1').get(decoded.id);
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const joinUrl = `${baseUrl}/join?vendor=${vendor.id}`;
    res.status(200).json({ success: true, joinUrl, vendorName: vendor.name });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Manual add customer (vendor dashboard)
router.post('/api/vendor/customers', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, fullname } = req.body || {};
    const phoneNorm = normalizePhoneForLookup((phone || '').toString().trim());
    if (phoneNorm.length < 6) {
      res.status(400).json({ success: false, msg: 'Valid phone number required' });
      return;
    }
    let customer = db.prepare('SELECT id, phone, fullname FROM customers WHERE phone = ?').get(phoneNorm);
    if (!customer) {
      const custId = uuidv4();
      db.prepare('INSERT INTO customers (id, phone, fullname, email, created_at) VALUES (?, ?, ?, ?, ?)').run(
        custId, phoneNorm, (fullname || '').trim() || null, '', Date.now()
      );
      db.prepare('INSERT OR IGNORE INTO shared_pool (customer_id, points) VALUES (?, 0)').run(custId);
      customer = { id: custId, phone: phoneNorm, fullname: (fullname || '').trim() || null };
    }
    db.prepare(`
      INSERT INTO balances (customer_id, vendor_id, points) VALUES (?, ?, 0)
      ON CONFLICT(customer_id, vendor_id) DO NOTHING
    `).run(customer.id, vendorId);
    res.status(200).json({ success: true, customer: { id: customer.id, phone: customer.phone, fullname: customer.fullname } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Dashboard stats for this vendor
router.get('/api/vendor/dashboard', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const txToday = db.prepare(`
      SELECT COUNT(*) as c, COALESCE(SUM(points), 0) as total
      FROM transactions WHERE vendor_id = ? AND timestamp >= ? AND type IN ('earned', 'shared_earned')
    `).get(vendorId, todayStart);
    const customerCount = db.prepare('SELECT COUNT(DISTINCT customer_id) as c FROM balances WHERE vendor_id = ?').get(vendorId).c;
    const recentTx = db.prepare(`
      SELECT t.id, t.type, t.points, t.amount, t.timestamp, c.phone, c.fullname
      FROM transactions t
      LEFT JOIN customers c ON c.id = t.customer_id
      WHERE t.vendor_id = ? ORDER BY t.timestamp DESC LIMIT 20
    `).all(vendorId);
    res.status(200).json({
      success: true,
      stats: {
        customers: customerCount,
        transactionsToday: txToday.c,
        pointsAwardedToday: txToday.total || 0
      },
      recentTransactions: recentTx
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Look up customer by phone (for award/redeem UI)
router.get('/api/vendor/customer', vendor_verify, (req, res) => {
  try {
    const phone = normalizePhoneForLookup(req.query.phone || '');
    if (!phone) {
      res.status(400).json({ success: false, msg: 'Phone required' });
      return;
    }
    const customer = db.prepare('SELECT id, phone, fullname, email FROM customers WHERE phone = ?').get(phone);
    if (!customer) {
      res.status(200).json({ success: true, customer: null });
      return;
    }
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const balance = db.prepare('SELECT points FROM balances WHERE customer_id = ? AND vendor_id = ?').get(customer.id, vendorId);
    const shared = db.prepare('SELECT points FROM shared_pool WHERE customer_id = ?').get(customer.id);
    const redemptionSetting = db.prepare("SELECT value FROM settings WHERE key = 'point_redemption_value'").get();
    const pointRedemptionValue = redemptionSetting ? parseFloat(redemptionSetting.value) : 0.10;
    const vendorPoints = balance ? balance.points : 0;
    const sharedPoints = shared ? shared.points : 0;
    res.status(200).json({
      success: true,
      customer: {
        ...customer,
        vendorPoints,
        vendorPointsValue: Math.round(vendorPoints * pointRedemptionValue * 100) / 100,
        sharedPoints,
        sharedPointsValue: Math.round(sharedPoints * pointRedemptionValue * 100) / 100
      },
      pointRedemptionValue
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Award points to customer (by phone and purchase amount). Applies shared rewards split.
router.post('/api/vendor/award', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, amount } = req.body;
    const amt = parseFloat(amount);
    if (!phone || isNaN(amt) || amt <= 0) {
      res.status(400).json({ success: false, msg: 'Valid phone and amount required' });
      return;
    }
    const vendor = db.prepare('SELECT id, points_per_dollar FROM vendors WHERE id = ? AND is_active = 1').get(vendorId);
    if (!vendor) {
      res.status(403).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    const phoneNorm = normalizePhoneForLookup(phone);
    let customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phoneNorm);
    if (!customer) {
      const custId = uuidv4();
      db.prepare('INSERT INTO customers (id, phone, fullname, email, created_at) VALUES (?, ?, ?, ?, ?)').run(custId, phoneNorm, '', '', Date.now());
      db.prepare('INSERT OR IGNORE INTO shared_pool (customer_id, points) VALUES (?, 0)').run(custId);
      customer = { id: custId };
    }
    const settings = db.prepare("SELECT value FROM settings WHERE key = 'shared_rewards_pct'").get();
    const sharedPct = settings ? parseFloat(settings.value) : 20;
    const totalPoints = amt * vendor.points_per_dollar;
    const sharedPoints = totalPoints * (sharedPct / 100);
    const vendorPoints = totalPoints - sharedPoints;

    const now = Date.now();
    db.prepare(`
      INSERT INTO balances (customer_id, vendor_id, points) VALUES (?, ?, ?)
      ON CONFLICT(customer_id, vendor_id) DO UPDATE SET points = points + excluded.points
    `).run(customer.id, vendorId, vendorPoints);
    db.prepare(`
      INSERT INTO shared_pool (customer_id, points) VALUES (?, ?)
      ON CONFLICT(customer_id) DO UPDATE SET points = points + excluded.points
    `).run(customer.id, sharedPoints);
    db.prepare(`
      INSERT INTO transactions (customer_id, vendor_id, type, points, amount, processed_by, timestamp)
      VALUES (?, ?, 'earned', ?, ?, ?, ?)
    `).run(customer.id, vendorId, vendorPoints, amt, decoded.id, now);
    db.prepare(`
      INSERT INTO transactions (customer_id, vendor_id, type, points, amount, processed_by, timestamp)
      VALUES (?, ?, 'shared_earned', ?, ?, ?, ?)
    `).run(customer.id, vendorId, sharedPoints, amt, decoded.id, now);

    res.status(200).json({
      success: true,
      awarded: { vendorPoints, sharedPoints, total: totalPoints }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Redeem: use_shared = true redeems from shared pool; false redeems from this vendor's balance
router.post('/api/vendor/redeem', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, points: pointsToRedeem, use_shared } = req.body;
    const pts = parseFloat(pointsToRedeem);
    if (!phone || isNaN(pts) || pts <= 0) {
      res.status(400).json({ success: false, msg: 'Valid phone and points required' });
      return;
    }
    const phoneNorm = normalizePhoneForLookup(phone);
    const customer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phoneNorm);
    if (!customer) {
      res.status(404).json({ success: false, msg: 'Customer not found' });
      return;
    }
    const now = Date.now();
    if (use_shared) {
      const row = db.prepare('SELECT points FROM shared_pool WHERE customer_id = ?').get(customer.id);
      const available = row ? row.points : 0;
      if (available < pts) {
        res.status(400).json({ success: false, msg: 'Insufficient shared points' });
        return;
      }
      db.prepare('UPDATE shared_pool SET points = points - ? WHERE customer_id = ?').run(pts, customer.id);
      db.prepare(`
        INSERT INTO transactions (customer_id, vendor_id, type, points, amount, processed_by, timestamp)
        VALUES (?, ?, 'shared_redeemed', ?, NULL, ?, ?)
      `).run(customer.id, vendorId, pts, decoded.id, now);
    } else {
      const row = db.prepare('SELECT id, points FROM balances WHERE customer_id = ? AND vendor_id = ?').get(customer.id, vendorId);
      const available = row ? row.points : 0;
      if (available < pts) {
        res.status(400).json({ success: false, msg: 'Insufficient vendor points' });
        return;
      }
      db.prepare('UPDATE balances SET points = points - ? WHERE customer_id = ? AND vendor_id = ?').run(pts, customer.id, vendorId);
      db.prepare(`
        INSERT INTO transactions (customer_id, vendor_id, type, points, amount, processed_by, timestamp)
        VALUES (?, ?, 'redeemed', ?, NULL, ?, ?)
      `).run(customer.id, vendorId, pts, decoded.id, now);
    }
    const redemptionSetting = db.prepare("SELECT value FROM settings WHERE key = 'point_redemption_value'").get();
    const pointRedemptionValue = redemptionSetting ? parseFloat(redemptionSetting.value) : 0.10;
    const dollarSavings = Math.round(pts * pointRedemptionValue * 100) / 100;
    res.status(200).json({ success: true, redeemed: pts, dollarSavings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List this vendor's transactions
router.get('/api/vendor/transactions', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const rows = db.prepare(`
      SELECT t.id, t.type, t.points, t.amount, t.timestamp, c.phone, c.fullname
      FROM transactions t
      LEFT JOIN customers c ON c.id = t.customer_id
      WHERE t.vendor_id = ? ORDER BY t.timestamp DESC LIMIT ? OFFSET ?
    `).all(vendorId, limit, offset);
    res.status(200).json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get vendor's own settings
router.get('/api/vendor/settings', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendor = db.prepare('SELECT id, name, email, phone, address, points_per_dollar FROM vendors WHERE id = ?').get(decoded.id);
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update vendor's own profile (name, phone, address, points_per_dollar)
router.put('/api/vendor/settings', vendor_verify, (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const { name, phone, address, points_per_dollar } = req.body;
    db.prepare(`
      UPDATE vendors SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), points_per_dollar = COALESCE(?, points_per_dollar) WHERE id = ?
    `).run(name ?? undefined, phone ?? undefined, address ?? undefined, points_per_dollar ?? undefined, decoded.id);
    const vendor = db.prepare('SELECT id, name, email, phone, address, points_per_dollar FROM vendors WHERE id = ?').get(decoded.id);
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
