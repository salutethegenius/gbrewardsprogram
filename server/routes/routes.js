const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../database/config');
const { verify, admin_verify } = require('../auth/verify');

const TOKEN_SECRET = process.env.TOKEN || 'user-secret';
const ADMIN_SECRET = process.env.ADMIN_TOKEN || 'admin-secret';

function decodeUserToken(req) {
  const token = req.query.token;
  if (!token) return null;
  try {
    return jwt.verify(token, TOKEN_SECRET);
  } catch (e) {
    return null;
  }
}

function decodeAdminToken(req) {
  const token = req.query.token;
  if (!token) return null;
  try {
    return jwt.verify(token, ADMIN_SECRET);
  } catch (e) {
    return null;
  }
}

// Admin dashboard stats (for frontend compatibility)
router.get('/api/admin/dashboard', admin_verify, (req, res) => {
  try {
    const storeCount = db.prepare('SELECT COUNT(*) as c FROM stores').get().c;
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const pointsToday = db.prepare(
      'SELECT COUNT(*) as c, COALESCE(SUM(point), 0) as total FROM points WHERE timestamp >= ?'
    ).get(todayStart);
    res.status(200).json({
      success: true,
      stats: {
        vendors: storeCount,
        customers: userCount,
        transactionsToday: pointsToday.c,
        pointsAwardedToday: pointsToday.total || 0
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List users for store (admin or user token with store_id)
router.get('/api/users', verify, (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const users = db.prepare(
      'SELECT id, store_id, email, fullname, phone, points, timestamp FROM users WHERE store_id = ? ORDER BY email'
    ).all(decoded.store_id);
    res.status(200).json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get current user (me)
router.get('/api/users/me', verify, (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const user = db.prepare(
      'SELECT id, store_id, email, fullname, phone, points, timestamp FROM users WHERE id = ?'
    ).get(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get one user by id (admin or same store)
router.get('/api/users/:id', verify, (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded) return res.status(401).json({ success: false, msg: 'Invalid token' });
    const user = db.prepare(
      'SELECT id, store_id, email, fullname, phone, points, timestamp FROM users WHERE id = ? AND store_id = ?'
    ).get(req.params.id, decoded.store_id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get histories for a user
router.get('/api/users/:id/histories', verify, (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded) return res.status(401).json({ success: false, msg: 'Invalid token' });
    const user = db.prepare('SELECT id, store_id FROM users WHERE id = ? AND store_id = ?').get(req.params.id, decoded.store_id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    const histories = db.prepare(
      'SELECT id, user_id, store_id, type, timestamp, by, point, amount FROM histories WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100'
    ).all(req.params.id);
    res.status(200).json({ success: true, data: histories });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// List points transactions for store (admin)
router.get('/api/points', admin_verify, (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const rows = db.prepare(
      'SELECT id, store_id, type, timestamp, point, by, to_user, amount FROM points WHERE store_id = ? ORDER BY timestamp DESC LIMIT 200'
    ).all(decoded.store_id);
    res.status(200).json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Add points to a user (admin) - records in points table, histories, and updates users.points
router.post('/api/points', admin_verify, (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { to_user, point, type, amount } = req.body || {};
    if (to_user == null || point == null || !type) {
      return res.status(400).json({ success: false, msg: 'Missing to_user, point, or type' });
    }
    const user = db.prepare('SELECT id, points FROM users WHERE id = ? AND store_id = ?').get(to_user, decoded.store_id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    const newPoints = (user.points || 0) + Number(point);
    const ts = Date.now();
    db.prepare('UPDATE users SET points = ? WHERE id = ?').run(newPoints, to_user);
    db.prepare(
      'INSERT INTO histories (user_id, store_id, type, timestamp, by, point, amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(to_user, decoded.store_id, type, ts, decoded.id, point, amount != null ? amount : null);
    db.prepare(
      'INSERT INTO points (store_id, type, timestamp, point, by, to_user, amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(decoded.store_id, type, ts, point, decoded.id, to_user, amount != null ? amount : null);
    const updated = db.prepare('SELECT id, email, fullname, points FROM users WHERE id = ?').get(to_user);
    res.status(200).json({ success: true, user: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Admin: list users for store
router.get('/api/admin/users', admin_verify, (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const users = db.prepare(
      'SELECT id, store_id, email, fullname, phone, points, timestamp FROM users WHERE store_id = ? ORDER BY email'
    ).all(decoded.store_id);
    res.status(200).json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Admin: list stores
router.get('/api/stores', admin_verify, (req, res) => {
  try {
    const stores = db.prepare('SELECT id, name, created_at FROM stores ORDER BY name').all();
    res.status(200).json({ success: true, data: stores });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
