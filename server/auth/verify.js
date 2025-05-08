const jwt = require('jsonwebtoken');

const verify = (req, res, next) => {
    const token = req.query.token

    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' })
    } else {
        const verifed = jwt.verify(token, process.env.TOKEN);
        if (verifed) {
            next()
        } else {
            res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
        }
    }
}

const admin_verify = (req, res, next) => {
    const token = req.query.token

    if (!token) {
        res.status(401).json({ success: false, error: 'Access Denied', msg: 'Unauthorised User' })
    } else {
        const verifed = jwt.verify(token, process.env.ADMIN_TOKEN);
        if (verifed) {
            next()
        } else {
            res.status(401).json({ success: false, error: 'Access Denied', msg: 'Invalid Auth Token' });
        }
    }
}

const security = {verify, admin_verify}

module.exports = security;