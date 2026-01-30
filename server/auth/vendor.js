const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/config');

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

// Public: vendor self-signup (creates pending account; admin must approve)
router.post('/api/vendor/signup', (req, res) => {
  try {
    signupSchema.validateAsync(req.body)
      .then((val) => {
        const existing = db.prepare('SELECT id FROM vendors WHERE email = ?').get(val.email);
        if (existing) {
          res.status(400).json({ success: false, msg: 'Email already registered' });
          return;
        }
        const id = uuidv4();
        const hash = bcrypt.hashSync(val.password, 10);
        db.prepare(`
          INSERT INTO vendors (id, name, email, password, phone, address, points_per_dollar, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?)
        `).run(id, val.name, val.email, hash, val.phone || '', val.address || '', Date.now());
        res.status(200).json({
          success: true,
          msg: 'Account created. Pending admin approval. You can sign in once approved.'
        });
      })
      .catch((err) => {
        res.status(400).json({ success: false, msg: 'Invalid request data' });
      });
  } catch (err) {
    console.error('Vendor signup error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

router.post('/api/vendor/signin', (req, res) => {
  try {
    loginSchema.validateAsync(req.body)
      .then((val) => {
        const row = db.prepare('SELECT * FROM vendors WHERE email = ? AND is_active = 1').get(val.email);
        if (!row) {
          res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No vendor found or account inactive' });
          return;
        }
        bcrypt.compare(val.password, row.password, (err, result) => {
          if (err) {
            console.error('Bcrypt error:', err);
            res.status(500).json({ success: false, msg: 'Server error' });
            return;
          }
          if (!result) {
            res.status(401).json({ success: false, msg: 'Invalid password' });
            return;
          }
          const secret = process.env.VENDOR_TOKEN || 'vendor-secret';
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
        });
      })
      .catch((err) => {
        res.status(401).json({ success: false, msg: 'Invalid request data' });
      });
  } catch (err) {
    console.error('Vendor signin error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
