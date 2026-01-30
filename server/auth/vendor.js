const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database/config');

const loginSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required()
});

router.post('/api/vendor/signin', (req, res) => {
  try {
    // #region agent log
    try { fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth/vendor.js:signin:entry', message: 'Vendor signin', data: { hasEmail: !!(req.body && req.body.email), secretSet: !!process.env.VENDOR_TOKEN }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {}); } catch (_) {}
    // #endregion
    loginSchema.validateAsync(req.body)
      .then((val) => {
        const row = db.prepare('SELECT * FROM vendors WHERE email = ? AND is_active = 1').get(val.email);
        // #region agent log
        try { fetch('http://127.0.0.1:7254/ingest/e16fbffe-9c0e-4a07-81be-22b06d107449', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth/vendor.js:signin:row', message: 'Vendor row lookup', data: { found: !!row }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => {}); } catch (_) {}
        // #endregion
        if (!row) {
          res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No vendor found or account inactive' });
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
          const secret = process.env.VENDOR_TOKEN || 'vendor-secret';
          const token = jwt.sign({ id: row.id }, secret);
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
        res.status(401).json({ success: false, error: err, msg: 'Invalid request data' });
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err, msg: 'Server error' });
  }
});

module.exports = router;
