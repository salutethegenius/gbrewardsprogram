const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const { vendor_verify, getTokenFromRequest } = require('../auth/verify');
const { normalizePhoneForLookup } = require('../utilities/algorithmns');
const { logAudit } = require('../utilities/audit');

const VENDOR_SECRET = process.env.VENDOR_TOKEN;

// Security: caps to prevent abuse/typos (points manipulation)
// Redeem cap = $100 equivalent at $0.10 per point (1 pt = $0.10)
const MAX_AWARD_AMOUNT_DOLLARS = 100;
const MAX_REDEEM_POINTS_PER_REQUEST = 1000;

router.post('/api/join', async (req, res) => {
  try {
    const { vendor_id, phone, fullname, email } = req.body || {};
    const phoneNorm = normalizePhoneForLookup((phone || '').toString().trim());
    const emailTrim = (email || '').toString().trim().toLowerCase();
    if (phoneNorm.length < 6) {
      res.status(400).json({ success: false, msg: 'Valid phone number required' });
      return;
    }
    if (!vendor_id) {
      res.status(400).json({ success: false, msg: 'Vendor required' });
      return;
    }
    const { data: vendor } = await supabase.from('vendors').select('id').eq('id', vendor_id).eq('is_active', true).single();
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    const { data: existingCust } = await supabase.from('customers').select('id, phone, fullname, email').eq('phone', phoneNorm).limit(1);
    let customer;
    if (existingCust && existingCust.length > 0) {
      customer = existingCust[0];
      if (emailTrim && !customer.email) {
        await supabase.from('customers').update({ email: emailTrim }).eq('id', customer.id);
        customer = { ...customer, email: emailTrim };
      }
    } else {
      const custId = uuidv4();
      await supabase.from('customers').insert({
        id: custId,
        phone: phoneNorm,
        fullname: (fullname || '').trim() || null,
        email: emailTrim || '',
        created_at: Date.now()
      });
      await supabase.from('shared_pool').upsert({ customer_id: custId, points: 0 }, { onConflict: 'customer_id' });
      customer = { id: custId, phone: phoneNorm, fullname: (fullname || '').trim() || null, email: emailTrim || '' };
    }
    await supabase.from('balances').upsert({ customer_id: customer.id, vendor_id, points: 0 }, { onConflict: 'customer_id,vendor_id' });
    res.status(200).json({ success: true, customer: { id: customer.id, phone: customer.phone, fullname: customer.fullname } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/join-info', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const { data: vendor } = await supabase.from('vendors').select('id, name').eq('id', decoded.id).eq('is_active', true).single();
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

router.post('/api/vendor/customers', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, fullname } = req.body || {};
    const phoneNorm = normalizePhoneForLookup((phone || '').toString().trim());
    if (phoneNorm.length < 6) {
      res.status(400).json({ success: false, msg: 'Valid phone number required' });
      return;
    }
    const { data: existingCust } = await supabase.from('customers').select('id, phone, fullname').eq('phone', phoneNorm).limit(1);
    let customer;
    if (existingCust && existingCust.length > 0) {
      customer = existingCust[0];
    } else {
      const custId = uuidv4();
      await supabase.from('customers').insert({ id: custId, phone: phoneNorm, fullname: (fullname || '').trim() || null, email: '', created_at: Date.now() });
      await supabase.from('shared_pool').upsert({ customer_id: custId, points: 0 }, { onConflict: 'customer_id' });
      customer = { id: custId, phone: phoneNorm, fullname: (fullname || '').trim() || null };
    }
    await supabase.from('balances').upsert({ customer_id: customer.id, vendor_id: vendorId, points: 0 }, { onConflict: 'customer_id,vendor_id' });
    res.status(200).json({ success: true, customer: { id: customer.id, phone: customer.phone, fullname: customer.fullname } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/customers', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const limit = Math.min(parseInt(req.query.limit) || 500, 1000);
    const offset = parseInt(req.query.offset) || 0;
    const { data: balanceRows, error: balErr } = await supabase
      .from('balances')
      .select('customer_id, points')
      .eq('vendor_id', vendorId)
      .order('points', { ascending: false })
      .range(offset, offset + limit - 1);
    if (balErr) throw balErr;
    if (!balanceRows || balanceRows.length === 0) {
      res.status(200).json({ success: true, customers: [] });
      return;
    }
    const customerIds = balanceRows.map((b) => b.customer_id);
    const { data: custRows, error: custErr } = await supabase
      .from('customers')
      .select('id, phone, fullname')
      .in('id', customerIds);
    if (custErr) throw custErr;
    const byId = (custRows || []).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    const customers = balanceRows.map((b) => ({
      id: b.customer_id,
      phone: byId[b.customer_id]?.phone ?? '—',
      fullname: byId[b.customer_id]?.fullname ?? '',
      points: b.points ?? 0
    }));
    res.status(200).json({ success: true, customers });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/dashboard', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { data: vendorRow } = await supabase.from('vendors').select('points_per_dollar').eq('id', vendorId).single();
    const pointsPerDollar = vendorRow?.points_per_dollar ?? 1;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const { data: txRows } = await supabase.from('transactions').select('points').eq('vendor_id', vendorId).gte('timestamp', todayStart).in('type', ['earned', 'shared_earned']);
    const txTotal = (txRows || []).reduce((sum, r) => sum + (r.points || 0), 0);
    const { count: customerCount } = await supabase.from('balances').select('*', { count: 'exact', head: true }).eq('vendor_id', vendorId);
    const { data: recentTxRows } = await supabase.from('transactions').select('id, type, points, amount, timestamp, customer_id').eq('vendor_id', vendorId).order('timestamp', { ascending: false }).limit(20);
    const recentTx = await Promise.all((recentTxRows || []).map(async (t) => {
      const { data: c } = await supabase.from('customers').select('phone, fullname').eq('id', t.customer_id).single();
      return { ...t, phone: c?.phone, fullname: c?.fullname };
    }));
    res.status(200).json({
      success: true,
      stats: {
        customers: customerCount || 0,
        transactionsToday: (txRows || []).length,
        pointsAwardedToday: txTotal
      },
      pointsPerDollar: pointsPerDollar,
      recentTransactions: recentTx
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/customer', vendor_verify, async (req, res) => {
  try {
    const phone = normalizePhoneForLookup(req.query.phone || '');
    if (!phone) {
      res.status(400).json({ success: false, msg: 'Phone required' });
      return;
    }
    const { data: customer, error: custErr } = await supabase.from('customers').select('id, phone, fullname, email').eq('phone', phone).maybeSingle();
    if (custErr) {
      res.status(500).json({ success: false, error: custErr.message });
      return;
    }
    if (!customer) {
      res.status(200).json({ success: true, customer: null });
      return;
    }
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { data: balanceRow } = await supabase.from('balances').select('points').eq('customer_id', customer.id).eq('vendor_id', vendorId).single();
    const { data: sharedRow } = await supabase.from('shared_pool').select('points').eq('customer_id', customer.id).single();
    const { data: redemptionRow } = await supabase.from('settings').select('value').eq('key', 'point_redemption_value').single();
    const pointRedemptionValue = redemptionRow ? parseFloat(redemptionRow.value) : 0.10;
    const vendorPoints = balanceRow ? balanceRow.points : 0;
    const sharedPoints = sharedRow ? sharedRow.points : 0;
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

router.post('/api/vendor/award', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, amount } = req.body;
    const amt = parseFloat(amount);
    if (!phone || typeof amount === 'undefined' || amount === null || amount === '') {
      res.status(400).json({ success: false, msg: 'Valid phone and amount required' });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      res.status(400).json({ success: false, msg: 'Amount must be a positive number' });
      return;
    }
    if (amt > MAX_AWARD_AMOUNT_DOLLARS) {
      res.status(400).json({ success: false, msg: `Amount cannot exceed $${MAX_AWARD_AMOUNT_DOLLARS.toLocaleString()} per transaction` });
      return;
    }
    const { data: vendor } = await supabase.from('vendors').select('id, points_per_dollar').eq('id', vendorId).eq('is_active', true).single();
    if (!vendor) {
      res.status(403).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    const phoneNorm = normalizePhoneForLookup(phone);
    let { data: custRows } = await supabase.from('customers').select('id').eq('phone', phoneNorm).limit(1);
    let customerId;
    if (custRows && custRows.length > 0) {
      customerId = custRows[0].id;
    } else {
      const custId = uuidv4();
      await supabase.from('customers').insert({ id: custId, phone: phoneNorm, fullname: '', email: '', created_at: Date.now() });
      await supabase.from('shared_pool').upsert({ customer_id: custId, points: 0 }, { onConflict: 'customer_id' });
      customerId = custId;
    }
    const { data: settingsRow } = await supabase.from('settings').select('value').eq('key', 'shared_rewards_pct').single();
    const sharedPct = settingsRow ? parseFloat(settingsRow.value) : 20;
    const totalPoints = amt * vendor.points_per_dollar;
    const sharedPoints = totalPoints * (sharedPct / 100);
    const vendorPoints = totalPoints - sharedPoints;
    const now = Date.now();

    const { data: existingBal } = await supabase.from('balances').select('points').eq('customer_id', customerId).eq('vendor_id', vendorId).single();
    const currentVendorPts = existingBal ? existingBal.points : 0;
    await supabase.from('balances').upsert({ customer_id: customerId, vendor_id: vendorId, points: currentVendorPts + vendorPoints }, { onConflict: 'customer_id,vendor_id' });

    const { data: existingShared } = await supabase.from('shared_pool').select('points').eq('customer_id', customerId).single();
    const currentSharedPts = existingShared ? existingShared.points : 0;
    await supabase.from('shared_pool').upsert({ customer_id: customerId, points: currentSharedPts + sharedPoints }, { onConflict: 'customer_id' });

    await supabase.from('transactions').insert({ customer_id: customerId, vendor_id: vendorId, type: 'earned', points: vendorPoints, amount: amt, processed_by: decoded.id, timestamp: now });
    await supabase.from('transactions').insert({ customer_id: customerId, vendor_id: vendorId, type: 'shared_earned', points: sharedPoints, amount: amt, processed_by: decoded.id, timestamp: now });

    await logAudit('vendor', vendorId, 'award_points', 'customer', customerId, { vendorPoints, sharedPoints, amount: amt }, req);

    res.status(200).json({
      success: true,
      awarded: { vendorPoints, sharedPoints, total: totalPoints }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/api/vendor/redeem', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const { phone, points: pointsToRedeem, use_shared } = req.body;
    const rawPts = parseFloat(pointsToRedeem);
    if (!phone || typeof pointsToRedeem === 'undefined' || pointsToRedeem === null || pointsToRedeem === '') {
      res.status(400).json({ success: false, msg: 'Valid phone and points required' });
      return;
    }
    if (!Number.isFinite(rawPts) || rawPts <= 0) {
      res.status(400).json({ success: false, msg: 'Points must be a positive number' });
      return;
    }
    if (rawPts > MAX_REDEEM_POINTS_PER_REQUEST) {
      res.status(400).json({ success: false, msg: `Cannot redeem more than ${MAX_REDEEM_POINTS_PER_REQUEST.toLocaleString()} points per transaction` });
      return;
    }
    const pts = Math.round(rawPts * 100) / 100;
    const phoneNorm = normalizePhoneForLookup(phone);
    const { data: customer, error: custErr } = await supabase.from('customers').select('id').eq('phone', phoneNorm).maybeSingle();
    if (custErr) {
      res.status(500).json({ success: false, error: custErr.message });
      return;
    }
    if (!customer) {
      res.status(404).json({ success: false, msg: 'Customer not found' });
      return;
    }
    const now = Date.now();
    if (use_shared) {
      const { data: row } = await supabase.from('shared_pool').select('points').eq('customer_id', customer.id).single();
      const available = row ? row.points : 0;
      if (available < pts) {
        res.status(400).json({ success: false, msg: 'Insufficient shared points' });
        return;
      }
      await supabase.from('shared_pool').update({ points: available - pts }).eq('customer_id', customer.id);
      await supabase.from('transactions').insert({ customer_id: customer.id, vendor_id: vendorId, type: 'shared_redeemed', points: pts, amount: null, processed_by: decoded.id, timestamp: now });
    } else {
      const { data: row } = await supabase.from('balances').select('id, points').eq('customer_id', customer.id).eq('vendor_id', vendorId).single();
      const available = row ? row.points : 0;
      if (available < pts) {
        res.status(400).json({ success: false, msg: 'Insufficient vendor points' });
        return;
      }
      await supabase.from('balances').update({ points: available - pts }).eq('customer_id', customer.id).eq('vendor_id', vendorId);
      await supabase.from('transactions').insert({ customer_id: customer.id, vendor_id: vendorId, type: 'redeemed', points: pts, amount: null, processed_by: decoded.id, timestamp: now });
    }
    const { data: redemptionRow } = await supabase.from('settings').select('value').eq('key', 'point_redemption_value').single();
    const pointRedemptionValue = redemptionRow ? parseFloat(redemptionRow.value) : 0.10;
    const dollarSavings = Math.round(pts * pointRedemptionValue * 100) / 100;

    await logAudit('vendor', vendorId, 'redeem_points', 'customer', customer.id, { points: pts, use_shared: !!use_shared }, req);

    res.status(200).json({ success: true, redeemed: pts, dollarSavings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/transactions', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const vendorId = decoded.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const { data: rows } = await supabase.from('transactions').select('id, type, points, amount, timestamp, customer_id').eq('vendor_id', vendorId).order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    const withCustomer = await Promise.all((rows || []).map(async (t) => {
      const { data: c } = await supabase.from('customers').select('phone, fullname').eq('id', t.customer_id).single();
      return { ...t, phone: c?.phone, fullname: c?.fullname };
    }));
    res.status(200).json({ success: true, data: withCustomer });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/vendor/settings', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const { data: vendor } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar').eq('id', decoded.id).single();
    if (!vendor) {
      res.status(404).json({ success: false, msg: 'Vendor not found' });
      return;
    }
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/api/vendor/settings', vendor_verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, VENDOR_SECRET);
    const { name, phone, address, points_per_dollar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (points_per_dollar !== undefined) updates.points_per_dollar = points_per_dollar;
    const { error: updateErr } = await supabase.from('vendors').update(updates).eq('id', decoded.id);
    if (updateErr) throw updateErr;
    const { data: vendor, error: fetchErr } = await supabase.from('vendors').select('id, name, email, phone, address, points_per_dollar').eq('id', decoded.id).single();
    if (fetchErr || !vendor) {
      res.status(500).json({ success: false, msg: 'Settings updated but failed to fetch vendor' });
      return;
    }
    res.status(200).json({ success: true, vendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
