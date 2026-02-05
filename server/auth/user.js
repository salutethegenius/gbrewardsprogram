const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../database/config');

const signinSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(1).required(),
  store_id: joi.string().optional()
});

const signupSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required(),
  fullname: joi.string().allow(''),
  phone: joi.string().allow(''),
  country_code: joi.string().allow(''),
  store_id: joi.string().optional()
});

async function getDefaultStoreId() {
  const { data: rows } = await supabase.from('stores').select('id').limit(1);
  return rows && rows.length > 0 ? rows[0].id : null;
}

router.post('/api/user/signin', async (req, res) => {
  try {
    const val = await signinSchema.validateAsync(req.body);
    const storeId = val.store_id || await getDefaultStoreId();
    if (!storeId) {
      res.status(500).json({ success: false, msg: 'No store configured' });
      return;
    }
    const { data: rows, error } = await supabase.from('users').select('*').eq('email', val.email).eq('store_id', storeId).limit(1);
    if (error || !rows || rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No user record found' });
      return;
    }
    const row = rows[0];
    const result = await bcrypt.compare(val.password, row.password);
    if (!result) {
      res.status(401).json({ success: false, error: 'Password Mismatch', msg: 'Invalid password' });
      return;
    }
    if (!process.env.TOKEN) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.TOKEN, { expiresIn: '7d' });
    const user = { id: row.id, store_id: row.store_id, email: row.email, fullname: row.fullname, phone: row.phone, points: row.points };
    res.status(200).json({ success: true, user, token });
  } catch (err) {
    if (err.isJoi) {
      res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      return;
    }
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

router.post('/api/user/signup', async (req, res) => {
  try {
    const val = await signupSchema.validateAsync(req.body);
    const storeId = val.store_id || await getDefaultStoreId();
    if (!storeId) {
      res.status(500).json({ success: false, msg: 'No store configured' });
      return;
    }
    const { data: existing } = await supabase.from('users').select('id').eq('email', val.email).eq('store_id', storeId).limit(1);
    if (existing && existing.length > 0) {
      res.status(401).json({ success: false, msg: 'Email already registered for this store' });
      return;
    }
    const id = uuidv4();
    const hash = bcrypt.hashSync(val.password, 10);
    const { error: insertErr } = await supabase.from('users').insert({
      id,
      store_id: storeId,
      email: val.email,
      password: hash,
      fullname: val.fullname || '',
      phone: val.phone || '',
      country_code: val.country_code || '',
      points: 0,
      timestamp: Date.now()
    });
    if (insertErr) {
      res.status(500).json({ success: false, error: insertErr, msg: 'Server error' });
      return;
    }
    const { data: rowData, error: selectErr } = await supabase.from('users').select('id, store_id, email, fullname, phone, points').eq('id', id).single();
    if (selectErr || !rowData) {
      res.status(500).json({ success: false, msg: 'Server error' });
      return;
    }
    const row = rowData;
    if (!process.env.TOKEN) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.TOKEN, { expiresIn: '7d' });
    const user = { id: row.id, store_id: row.store_id, email: row.email, fullname: row.fullname, phone: row.phone, points: row.points };
    res.status(200).json({ success: true, user, token });
  } catch (err) {
    if (err.isJoi) {
      res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      return;
    }
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

module.exports = router;
