const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../database/config');
const { admin_verify, getTokenFromRequest } = require('../auth/verify');
const { logAudit } = require('../utilities/audit');
const joi = require('joi');

const ADMIN_SECRET = process.env.ADMIN_TOKEN;
function getAdminId(req) {
  try {
    const token = getTokenFromRequest(req);
    if (!token || !ADMIN_SECRET) return null;
    const decoded = jwt.verify(token, ADMIN_SECRET);
    return decoded && decoded.id ? decoded.id : null;
  } catch (e) {
    return null;
  }
}

const vendorSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  phone: joi.string().allow(''),
  address: joi.string().allow(''),
  points_per_dollar: joi.number().min(0).default(1)
});

router.get('/api/admin/dashboard', admin_verify, async (req, res) => {
  try {
    const { count: vendorCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const { data: txRows } = await supabase.from('transactions').select('points').gte('timestamp', todayStart).in('type', ['earned', 'shared_earned']);
    const txTotal = (txRows || []).reduce((sum, r) => sum + (r.points || 0), 0);
    await logAudit('admin', getAdminId(req), 'view_dashboard', null, null, null, req);
    res.status(200).json({
      success: true,
      stats: {
        vendors: vendorCount || 0,
        customers: customerCount || 0,
        transactionsToday: (txRows || []).length,
        pointsAwardedToday: txTotal
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/vendors', admin_verify, async (req, res) => {
  try {
    const { data: vendors, error } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar, is_active, created_at').order('name');
    if (error) throw error;
    await logAudit('admin', getAdminId(req), 'view_vendors', 'vendors', null, null, req);
    res.status(200).json({ success: true, data: vendors || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/api/admin/vendors', admin_verify, async (req, res) => {
  try {
    const val = await vendorSchema.validateAsync(req.body);
    const { data: existing } = await supabase.from('vendors').select('id').eq('email', val.email).limit(1);
    if (existing && existing.length > 0) {
      res.status(401).json({ success: false, msg: 'Email already registered' });
      return;
    }
    const id = uuidv4();
    const hash = bcrypt.hashSync(val.password, 10);
    const { error: insertErr } = await supabase.from('vendors').insert({
      id,
      name: val.name,
      email: val.email,
      password: hash,
      phone: val.phone || '',
      address: val.address || '',
      points_per_dollar: val.points_per_dollar || 1,
      is_active: true,
      created_at: Date.now()
    });
    if (insertErr) throw insertErr;
    const { data: vendor, error: fetchErr } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar, is_active, created_at').eq('id', id).single();
    if (fetchErr || !vendor) {
      res.status(500).json({ success: false, msg: 'Vendor created but failed to fetch' });
      return;
    }
    await logAudit('admin', getAdminId(req), 'create_vendor', 'vendor', id, { name: val.name }, req);
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    if (e.isJoi) {
      res.status(400).json({ success: false, error: e.message });
      return;
    }
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/vendors/:id', admin_verify, async (req, res) => {
  try {
    const { data: vendor, error } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar, is_active, created_at').eq('id', req.params.id).single();
    if (error || !vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/api/admin/vendors/:id', admin_verify, async (req, res) => {
  try {
    const { name, phone, address, points_per_dollar, is_active } = req.body;
    const id = req.params.id;
    const { data: existing } = await supabase.from('vendors').select('id').eq('id', id).single();
    if (!existing) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (points_per_dollar !== undefined) updates.points_per_dollar = points_per_dollar;
    if (is_active !== undefined) updates.is_active = is_active;
    await supabase.from('vendors').update(updates).eq('id', id);
    const { data: vendor, error: fetchErr } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar, is_active, created_at').eq('id', id).single();
    if (fetchErr || !vendor) {
      res.status(500).json({ success: false, msg: 'Failed to fetch updated vendor' });
      return;
    }
    await logAudit('admin', getAdminId(req), 'update_vendor', 'vendor', id, null, req);
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/customers', admin_verify, async (req, res) => {
  try {
    const { data: customers, error } = await supabase.from('customers').select('id, phone, fullname, email, created_at').order('created_at', { ascending: false });
    if (error) throw error;
    await logAudit('admin', getAdminId(req), 'view_customers', 'customers', null, null, req);
    res.status(200).json({ success: true, data: customers || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/transactions', admin_verify, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    const { data: plainRows, error } = await supabase.from('transactions').select('id, customer_id, vendor_id, type, points, amount, processed_by, timestamp').order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    const withNames = await Promise.all((plainRows || []).map(async (t) => {
      const { data: c } = await supabase.from('customers').select('phone, fullname').eq('id', t.customer_id).single();
      const { data: v } = await supabase.from('vendors').select('name').eq('id', t.vendor_id).single();
      return { ...t, customer_phone: c?.phone, customer_name: c?.fullname, vendor_name: v?.name };
    }));
    await logAudit('admin', getAdminId(req), 'view_transactions', 'transactions', null, null, req);
    res.status(200).json({ success: true, data: withNames });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/settings', admin_verify, async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const settings = {};
    (rows || []).forEach((r) => { settings[r.key] = r.value; });
    res.status(200).json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/api/admin/settings', admin_verify, async (req, res) => {
  try {
    const { shared_rewards_pct } = req.body;
    if (shared_rewards_pct != null) {
      const pct = Math.max(0, Math.min(100, parseFloat(shared_rewards_pct)));
      await supabase.from('settings').upsert({ key: 'shared_rewards_pct', value: String(pct) }, { onConflict: 'key' });
    }
    const { data: rows, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const settings = {};
    (rows || []).forEach((r) => { settings[r.key] = r.value; });
    await logAudit('admin', getAdminId(req), 'update_settings', 'settings', null, null, req);
    res.status(200).json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/admin/audit', admin_verify, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    const { data: rows, error } = await supabase.from('audit_log').select('id, actor_type, actor_id, action, resource_type, resource_id, details, ip, user_agent, created_at').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    res.status(200).json({ success: true, data: rows || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
