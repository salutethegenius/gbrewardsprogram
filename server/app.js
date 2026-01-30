const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load env BEFORE importing anything that needs it
dotenv.config();

const cookieParser = require('cookie-parser');
const enforce = require('express-sslify');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load DB (creates tables + seed admin)
require('./database/config');

// Rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window
  message: { success: false, msg: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, msg: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

const admin_auth = require('./auth/admin');
const user_auth = require('./auth/user');
const vendor_auth = require('./auth/vendor');
const customer_auth = require('./auth/customer');
const routes = require('./routes/routes');
const admin_routes = require('./routes/admin');
const vendor_routes = require('./routes/vendor');
const customer_routes = require('./routes/customer');

const app = express();
const PORT = process.env.PORT || 4040;

if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for SPA compatibility
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// General API rate limit
app.use('/api/', apiLimiter);

// Stricter rate limit on auth endpoints
app.use('/api/admin/signin', authLimiter);
app.use('/api/vendor/signin', authLimiter);
app.use('/api/vendor/signup', authLimiter);
app.use('/api/customer/login', authLimiter);

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
  next();
});

app.use(admin_auth);
app.use(user_auth);
app.use(vendor_auth);
app.use(customer_auth);
app.use(admin_routes);
app.use(routes);
app.use(vendor_routes);
app.use(customer_routes);

// SPA fallback: serve frontend for non-API routes (after static and API)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
