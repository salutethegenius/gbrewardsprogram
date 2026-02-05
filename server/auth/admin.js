const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../database/config');
const { logAudit } = require('../utilities/audit');

const loginSchema = joi.object({
  email: joi.string().min(5).required().email(),
  password: joi.string().min(8).required()
});

router.post('/api/admin/signin', async (req, res) => {
  try {
    const val = await loginSchema.validateAsync(req.body);
    const { data: rows, error } = await supabase.from('admins').select('*').eq('email', val.email).limit(1);
    if (error || !rows || rows.length === 0) {
      res.status(401).json({ success: false, error: 'Invalid Email', msg: 'No email record available' });
      return;
    }
    const row = rows[0];
    const result = await bcrypt.compare(val.password, row.password);
    if (!result) {
      res.status(401).json({ success: false, msg: 'Invalid password' });
      return;
    }
    if (!process.env.ADMIN_TOKEN) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: row.id, store_id: row.store_id }, process.env.ADMIN_TOKEN, { expiresIn: '8h' });
    const admin = { id: row.id, store_id: row.store_id, email: row.email, fullname: row.fullname };
    await logAudit('admin', row.id, 'login', null, null, null, req);
    res.status(200).json({ success: true, admin, token });
  } catch (err) {
    if (err.isJoi) {
      res.status(401).json({ success: false, msg: 'Invalid request data' });
      return;
    }
    console.error('Admin signin error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
