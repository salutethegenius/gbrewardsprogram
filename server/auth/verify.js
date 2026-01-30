const jwt = require('jsonwebtoken');

const verify = (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' });
        return;
    }
    try {
        const secret = process.env.TOKEN || 'user-secret';
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
    }
}

const admin_verify = (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' });
        return;
    }
    try {
        const secret = process.env.ADMIN_TOKEN || 'admin-secret';
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
    }
}

const vendor_verify = (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' });
        return;
    }
    try {
        const secret = process.env.VENDOR_TOKEN || 'vendor-secret';
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
    }
}

const security = { verify, admin_verify, vendor_verify }

module.exports = security;