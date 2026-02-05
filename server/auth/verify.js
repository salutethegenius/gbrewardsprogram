const jwt = require('jsonwebtoken');

function getTokenFromRequest(req) {
    const auth = req.headers.authorization;
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
        return auth.slice(7).trim();
    }
    return null;
}

const verify = (req, res, next) => {
    const token = getTokenFromRequest(req);
    const isCustomerRoute = req.path && req.path.startsWith('/api/customer/');
    const authMsg = isCustomerRoute ? 'Session expired or invalid. Please sign in again.' : 'Unauthorised User';
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: authMsg });
        return;
    }
    try {
        const secret = process.env.TOKEN;
        if (!secret) {
            res.status(503).json({ success: false, error: 'Access Denied', msg: 'Server configuration error' });
            return;
        }
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: isCustomerRoute ? authMsg : 'Invalid Auth Token' });
    }
}

const admin_verify = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' });
        return;
    }
    try {
        const secret = process.env.ADMIN_TOKEN;
        if (!secret) {
            res.status(503).json({ success: false, error: 'Access Denied', msg: 'Server configuration error' });
            return;
        }
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
    }
}

const vendor_verify = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' });
        return;
    }
    try {
        const secret = process.env.VENDOR_TOKEN;
        if (!secret) {
            res.status(503).json({ success: false, error: 'Access Denied', msg: 'Server configuration error' });
            return;
        }
        jwt.verify(token, secret);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
    }
}

const security = { verify, admin_verify, vendor_verify, getTokenFromRequest };

module.exports = security;