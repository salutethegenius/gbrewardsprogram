const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/config');

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

function getDefaultStoreId() {
  const row = db.prepare('SELECT id FROM stores LIMIT 1').get();
  return row ? row.id : null;
}

router.post('/api/user/signin', (req, res) => {
  try {
    signinSchema.validateAsync(req.body)
      .then((val) => {
        const storeId = val.store_id || getDefaultStoreId();
        if (!storeId) {
          res.status(500).json({ success: false, msg: 'No store configured' });
          return;
        }
        const row = db.prepare('SELECT * FROM users WHERE email = ? AND store_id = ?').get(val.email, storeId);
        if (!row) {
          res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No user record found' });
          return;
        }
        bcrypt.compare(val.password, row.password, (err, result) => {
          if (err) {
            res.status(500).json({ success: false, error: err, msg: 'Server error' });
            return;
          }
          if (!result) {
            res.status(401).json({ success: false, error: 'Password Mismatch', msg: 'Invalid password' });
            return;
          }
          const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.TOKEN || 'user-secret', { expiresIn: '7d' });
          const user = {
            id: row.id,
            store_id: row.store_id,
            email: row.email,
            fullname: row.fullname,
            phone: row.phone,
            points: row.points
          };
          res.status(200).json({ success: true, user, token });
        });
      })
      .catch((err) => {
        res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

router.post('/api/user/signup', (req, res) => {
  try {
    signupSchema.validateAsync(req.body)
      .then((val) => {
        const storeId = val.store_id || getDefaultStoreId();
        if (!storeId) {
          res.status(500).json({ success: false, msg: 'No store configured' });
          return;
        }
        const existing = db.prepare('SELECT id FROM users WHERE email = ? AND store_id = ?').get(val.email, storeId);
        if (existing) {
          res.status(401).json({ success: false, msg: 'Email already registered for this store' });
          return;
        }
        const id = uuidv4();
        const hash = bcrypt.hashSync(val.password, 10);
        db.prepare(`
          INSERT INTO users (id, store_id, email, password, fullname, phone, country_code, points, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        `).run(id, storeId, val.email, hash, val.fullname || '', val.phone || '', val.country_code || '', Date.now());
        const row = db.prepare('SELECT id, store_id, email, fullname, phone, points FROM users WHERE id = ?').get(id);
        const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.TOKEN || 'user-secret', { expiresIn: '7d' });
        const user = {
          id: row.id,
          store_id: row.store_id,
          email: row.email,
          fullname: row.fullname,
          phone: row.phone,
          points: row.points
        };
        res.status(200).json({ success: true, user, token });
      })
      .catch((err) => {
        res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

module.exports = router;
