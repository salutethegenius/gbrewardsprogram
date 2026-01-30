const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database/config');

const loginSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required()
});

router.post('/api/admin/signin', (req, res) => {
  try {
    loginSchema.validateAsync(req.body)
      .then((val) => {
        const row = db.prepare('SELECT * FROM admins WHERE email = ? LIMIT 1').get(val.email);
        if (!row) {
          res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No email record available' });
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
          const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.ADMIN_TOKEN || 'admin-secret');
          const admin = { id: row.id, store_id: row.store_id, email: row.email, fullname: row.fullname };
          res.status(200).json({ success: true, admin, token });
        });
      })
      .catch((err) => {
        res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

module.exports = router;
