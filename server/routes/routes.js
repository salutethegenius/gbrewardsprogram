const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../database/config');
const { verify, admin_verify } = require('../auth/verify');

const TOKEN_SECRET = process.env.TOKEN;
const ADMIN_SECRET = process.env.ADMIN_TOKEN;

function decodeUserToken(req) {
  const token = req.query.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token || !TOKEN_SECRET) return null;
  try {
    return jwt.verify(token, TOKEN_SECRET);
  } catch (e) {
    return null;
  }
}

function decodeAdminToken(req) {
  const token = req.query.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token || !ADMIN_SECRET) return null;
  try {
    return jwt.verify(token, ADMIN_SECRET);
  } catch (e) {
    return null;
  }
}

router.get('/api/admin/dashboard', admin_verify, async (req, res) => {
  try {
    const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const { data: pointsRows } = await supabase.from('points').select('point').gte('timestamp', todayStart);
    const pointsTodayTotal = (pointsRows || []).reduce((sum, r) => sum + (r.point || 0), 0);
    res.status(200).json({
      success: true,
      stats: {
        vendors: storeCount || 0,
        customers: userCount || 0,
        transactionsToday: (pointsRows || []).length,
        pointsAwardedToday: pointsTodayTotal
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/users', verify, async (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { data: users, error } = await supabase.from('users').select('id, store_id, email, fullname, phone, points, timestamp').eq('store_id', decoded.store_id).order('email');
    if (error) throw error;
    res.status(200).json({ success: true, data: users || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/users/me', verify, async (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { data: user, error } = await supabase.from('users').select('id, store_id, email, fullname, phone, points, timestamp').eq('id', decoded.id).single();
    if (error || !user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/users/:id', verify, async (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded) return res.status(401).json({ success: false, msg: 'Invalid token' });
    const { data: user, error } = await supabase.from('users').select('id, store_id, email, fullname, phone, points, timestamp').eq('id', req.params.id).eq('store_id', decoded.store_id).single();
    if (error || !user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/users/:id/histories', verify, async (req, res) => {
  try {
    const decoded = decodeUserToken(req);
    if (!decoded) return res.status(401).json({ success: false, msg: 'Invalid token' });
    const { data: user } = await supabase.from('users').select('id, store_id').eq('id', req.params.id).eq('store_id', decoded.store_id).single();
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    const { data: histories, error } = await supabase.from('histories').select('id, user_id, store_id, type, timestamp, by, point, amount').eq('user_id', req.params.id).order('timestamp', { ascending: false }).limit(100);
    if (error) throw error;
    res.status(200).json({ success: true, data: histories || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/points', admin_verify, async (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { data: rows, error } = await supabase.from('points').select('id, store_id, type, timestamp, point, by, to_user, amount').eq('store_id', decoded.store_id).order('timestamp', { ascending: false }).limit(200);
    if (error) throw error;
    res.status(200).json({ success: true, data: rows || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/api/points', admin_verify, async (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { to_user, point, type, amount } = req.body || {};
    if (to_user == null || point == null || !type) {
      return res.status(400).json({ success: false, msg: 'Missing to_user, point, or type' });
    }
    const { data: user, error: userErr } = await supabase.from('users').select('id, points').eq('id', to_user).eq('store_id', decoded.store_id).single();
    if (userErr || !user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    const newPoints = (user.points || 0) + Number(point);
    const ts = Date.now();
    await supabase.from('users').update({ points: newPoints }).eq('id', to_user);
    await supabase.from('histories').insert({
      user_id: to_user,
      store_id: decoded.store_id,
      type,
      timestamp: ts,
      by: decoded.id,
      point: Number(point),
      amount: amount != null ? amount : null
    });
    await supabase.from('points').insert({
      store_id: decoded.store_id,
      type,
      timestamp: ts,
      point: Number(point),
      by: decoded.id,
      to_user,
      amount: amount != null ? amount : null
    });
    const { data: updated } = await supabase.from('users').select('id, email, fullname, points').eq('id', to_user).single();
    res.status(200).json({ success: true, user: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/users', admin_verify, async (req, res) => {
  try {
    const decoded = decodeAdminToken(req);
    if (!decoded || !decoded.store_id) {
      return res.status(401).json({ success: false, msg: 'Invalid token' });
    }
    const { data: users, error } = await supabase.from('users').select('id, store_id, email, fullname, phone, points, timestamp').eq('store_id', decoded.store_id).order('email');
    if (error) throw error;
    res.status(200).json({ success: true, data: users || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/stores', admin_verify, async (req, res) => {
  try {
    const { data: stores, error } = await supabase.from('stores').select('id, name, created_at').order('name');
    if (error) throw error;
    res.status(200).json({ success: true, data: stores || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
