const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const { supabase } = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const { normalizePhoneForLookup } = require('../utilities/algorithmns');

const phoneSchema = joi.object({
  phone: joi.string().min(6).required()
});

router.post('/api/customer/login', async (req, res) => {
  try {
    const val = await phoneSchema.validateAsync(req.body);
    const phone = normalizePhoneForLookup(val.phone);
    const { data: existingRows } = await supabase.from('customers').select('id, phone, fullname, email, created_at').eq('phone', phone).maybeSingle();
    const existing = existingRows || null;
    let customer;
    if (existing) {
      customer = existing;
    } else {
      const id = uuidv4();
      const { error: insertErr } = await supabase.from('customers').insert({
        id,
        phone,
        fullname: '',
        email: '',
        created_at: Date.now()
      });
      if (insertErr) {
        res.status(500).json({ success: false, msg: 'Server error' });
        return;
      }
      await supabase.from('shared_pool').upsert({ customer_id: id, points: 0 }, { onConflict: 'customer_id' });
      customer = { id, phone, fullname: '', email: '', created_at: Date.now() };
    }
    const secret = process.env.TOKEN;
    if (!secret) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: customer.id }, secret, { expiresIn: '7d' });
    res.status(200).json({ success: true, customer, token });
  } catch (err) {
    if (err.isJoi) {
      res.status(401).json({ success: false, msg: 'Invalid phone number' });
      return;
    }
    console.error('Customer login error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
