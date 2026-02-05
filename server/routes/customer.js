const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../database/config');
const { verify, getTokenFromRequest } = require('../auth/verify');

router.get('/api/customer/balances', verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, process.env.TOKEN);
    const customerId = decoded.id;
    const { data: balanceRows } = await supabase.from('balances').select('vendor_id, points').eq('customer_id', customerId).gt('points', 0).order('points', { ascending: false });
    const vendorBalancesWithName = await Promise.all((balanceRows || []).map(async (b) => {
      const { data: v } = await supabase.from('vendors').select('name').eq('id', b.vendor_id).eq('is_active', true).single();
      return v ? { ...b, vendor_name: v.name } : null;
    }));
    const vendorBalances = (vendorBalancesWithName || []).filter(Boolean);
    const { data: sharedRow } = await supabase.from('shared_pool').select('points').eq('customer_id', customerId).single();
    const { data: redemptionRow } = await supabase.from('settings').select('value').eq('key', 'point_redemption_value').single();
    const pointRedemptionValue = redemptionRow ? parseFloat(redemptionRow.value) : 0.10;
    const sharedPts = sharedRow ? sharedRow.points : 0;
    const vendorBalancesWithValue = vendorBalances.map((b) => ({
      ...b,
      pointsValue: Math.round((b.points || 0) * pointRedemptionValue * 100) / 100
    }));
    res.status(200).json({
      success: true,
      vendorBalances: vendorBalancesWithValue,
      sharedPoints: sharedPts,
      sharedPointsValue: Math.round(sharedPts * pointRedemptionValue * 100) / 100,
      pointRedemptionValue
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/customer/transactions', verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, process.env.TOKEN);
    const customerId = decoded.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const { data: rows } = await supabase.from('transactions').select('id, type, points, amount, timestamp, vendor_id').eq('customer_id', customerId).order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    const withVendor = await Promise.all((rows || []).map(async (t) => {
      const { data: v } = await supabase.from('vendors').select('name').eq('id', t.vendor_id).single();
      return { ...t, vendor_name: v?.name };
    }));
    res.status(200).json({ success: true, data: withVendor });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/api/customer/me', verify, async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const decoded = jwt.verify(token, process.env.TOKEN);
    const { data: customer } = await supabase.from('customers').select('id, phone, fullname, email, created_at').eq('id', decoded.id).single();
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
