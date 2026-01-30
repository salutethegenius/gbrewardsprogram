const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const db = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const { normalizePhoneForLookup } = require('../utilities/algorithmns');

const phoneSchema = joi.object({
  phone: joi.string().min(6).required()
});

router.post('/api/customer/login', (req, res) => {
  try {
    phoneSchema.validateAsync(req.body)
      .then((val) => {
        const phone = normalizePhoneForLookup(val.phone);
        let customer = db.prepare('SELECT id, phone, fullname, email, created_at FROM customers WHERE phone = ?').get(phone);
        if (!customer) {
          const id = uuidv4();
          db.prepare(`
            INSERT INTO customers (id, phone, fullname, email, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(id, phone, '', '', Date.now());
          db.prepare('INSERT OR IGNORE INTO shared_pool (customer_id, points) VALUES (?, 0)').run(id);
          customer = { id, phone, fullname: '', email: '', created_at: Date.now() };
        }
        const secret = process.env.TOKEN || 'user-secret';
        const token = jwt.sign({ id: customer.id }, secret, { expiresIn: '7d' });
        res.status(200).json({ success: true, customer, token });
      })
      .catch((err) => {
        res.status(401).json({ success: false, msg: 'Invalid phone number' });
      });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
