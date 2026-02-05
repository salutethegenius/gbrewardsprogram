const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { supabase } = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const { normalizePhoneForLookup } = require('../utilities/algorithmns');
const { sendMagicLink } = require('../utilities/mailer');

const loginSchema = joi.object({
  phone: joi.string().min(6).required(),
  email: joi.string().email().allow('').optional()
});

// Request a magic link: phone required; email required if customer has no email on file
router.post('/api/customer/login', async (req, res) => {
  try {
    const val = await loginSchema.validateAsync(req.body);
    const phone = normalizePhoneForLookup(val.phone);
    const email = (val.email || '').trim().toLowerCase();

    // Look up by normalized phone; also try with/without leading 1 (e.g. 12424479692 vs 2424479692)
    let existing = null;
    const { data: byPhone } = await supabase.from('customers').select('id, phone, fullname, email, created_at').eq('phone', phone).maybeSingle();
    if (byPhone) {
      existing = byPhone;
    } else if (phone.length === 10 && phone.startsWith('2')) {
      const { data: withOne } = await supabase.from('customers').select('id, phone, fullname, email, created_at').eq('phone', '1' + phone).maybeSingle();
      if (withOne) existing = withOne;
    } else if (phone.length === 11 && phone.startsWith('1')) {
      const { data: withoutOne } = await supabase.from('customers').select('id, phone, fullname, email, created_at').eq('phone', phone.slice(1)).maybeSingle();
      if (withoutOne) existing = withoutOne;
    }

    const genericMsg = "If an account exists for this number, we've sent a login link. Check your email (and spam). If you didn't get one, add your email below and try again.";

    if (!existing) {
      res.status(200).json({ success: true, msg: genericMsg });
      return;
    }

    let sendTo = existing.email || email;
    if (!sendTo) {
      res.status(200).json({
        success: true,
        msg: "We need your email to send a secure login link. Enter your email above and click Send again."
      });
      return;
    }

    if (!existing.email && email) {
      const { error: updateErr } = await supabase.from('customers').update({ email }).eq('id', existing.id);
      if (updateErr) {
        res.status(500).json({ success: false, msg: 'Server error' });
        return;
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes

    const { error: insertErr } = await supabase.from('customer_login_tokens').insert({
      token,
      customer_id: existing.id,
      expires_at: expiresAt,
      created_at: now
    });
    if (insertErr) {
      console.error('Customer login token insert error:', insertErr);
      res.status(500).json({ success: false, msg: 'Server error. If this keeps happening, ask support to run the customer_login_tokens migration.' });
      return;
    }

    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const loginLink = `${baseUrl}/customer/verify?token=${token}`;
    const sent = await sendMagicLink(sendTo, loginLink);

    res.status(200).json({
      success: true,
      msg: sent
        ? "Check your email for a login link. It expires in 15 minutes."
        : "We couldn't send the email. Please try again or contact support."
    });
  } catch (err) {
    if (err.isJoi) {
      res.status(400).json({ success: false, msg: 'Invalid phone or email' });
      return;
    }
    console.error('Customer login error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Exchange magic-link token for JWT (called by frontend after user clicks link)
router.post('/api/customer/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, msg: 'Invalid link' });
      return;
    }

    const { data: row, error } = await supabase
      .from('customer_login_tokens')
      .select('customer_id, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (error || !row) {
      res.status(400).json({ success: false, msg: 'Invalid or expired link. Request a new one.' });
      return;
    }
    if (row.expires_at < Date.now()) {
      await supabase.from('customer_login_tokens').delete().eq('token', token);
      res.status(400).json({ success: false, msg: 'This link has expired. Request a new one.' });
      return;
    }

    await supabase.from('customer_login_tokens').delete().eq('token', token);

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('id, phone, fullname, email, created_at')
      .eq('id', row.customer_id)
      .single();

    if (custErr || !customer) {
      res.status(400).json({ success: false, msg: 'Account not found.' });
      return;
    }

    const secret = process.env.TOKEN;
    if (!secret) {
      res.status(503).json({ success: false, msg: 'Server configuration error' });
      return;
    }
    const jwtToken = jwt.sign({ id: customer.id }, secret, { expiresIn: '7d' });

    res.status(200).json({ success: true, customer, token: jwtToken });
  } catch (err) {
    console.error('Customer verify error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
