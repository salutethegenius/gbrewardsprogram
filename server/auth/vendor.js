const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../database/config');

const loginSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required()
});

const signupSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required(),
  phone: joi.string().allow(''),
  address: joi.string().allow('')
});

router.post('/api/vendor/signup', async (req, res) => {
  try {
    const val = await signupSchema.validateAsync(req.body);
    const { data: existing } = await supabase.from('vendors').select('id').eq('email', val.email).limit(1);
    if (existing && existing.length > 0) {
      res.status(400).json({ success: false, msg: 'Email already registered' });
      return;
    }
    const id = uuidv4();
    const hash = bcrypt.hashSync(val.password, 10);
    const { error } = await supabase.from('vendors').insert({
      id,
      name: val.name,
      email: val.email,
      password: hash,
      phone: val.phone || '',
      address: val.address || '',
      points_per_dollar: 1,
      is_active: false,
      created_at: Date.now()
    });
    if (error) {
      res.status(500).json({ success: false, msg: 'Server error' });
      return;
    }
    res.status(200).json({
      success: true,
      msg: 'Account created. Pending admin approval. You can sign in once approved.'
    });
  } catch (err) {
    if (err.isJoi) {
      res.status(400).json({ success: false, msg: 'Invalid request data' });
      return;
    }
    console.error('Vendor signup error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

router.post('/api/vendor/signin', async (req, res) => {
  try {
    const val = await loginSchema.validateAsync(req.body);
    const { data: rows, error } = await supabase.from('vendors').select('*').eq('email', val.email).eq('is_active', true).limit(1);
    if (error || !rows || rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No vendor found or account inactive' });
      return;
    }
    const row = rows[0];
    const result = await bcrypt.compare(val.password, row.password);
    if (!result) {
      res.status(401).json({ success: false, msg: 'Invalid password' });
      return;
    }
    const secret = process.env.VENDOR_TOKEN;
    if (!secret) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: row.id }, secret, { expiresIn: '12h' });
    const vendor = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      points_per_dollar: row.points_per_dollar
    };
    res.status(200).json({ success: true, vendor, token });
  } catch (err) {
    if (err.isJoi) {
      res.status(401).json({ success: false, msg: 'Invalid request data' });
      return;
    }
    console.error('Vendor signin error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
