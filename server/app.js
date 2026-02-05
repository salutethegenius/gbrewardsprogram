const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load env BEFORE importing anything that needs it
dotenv.config();

// Validate required environment variables at startup
const required = ['TOKEN', 'ADMIN_TOKEN', 'VENDOR_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
if (process.env.NODE_ENV === 'production') {
  required.push('FRONTEND_URL');
}
const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === '');
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Set them in .env or the environment. See server/.env.example.');
  process.exit(1);
}

const cookieParser = require('cookie-parser');
const enforce = require('express-sslify');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load DB client and seed helper
const { seedAsync } = require('./database/config');

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

// Stricter limit for sensitive operations (points award/redeem, admin actions)
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, msg: 'Too many requests. Please try again later.' },
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

const frontendOrigin = process.env.FRONTEND_URL;
// In development (no FRONTEND_URL), allow localhost so the app can be tested locally
const corsOrigin = frontendOrigin
  ? [frontendOrigin]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
app.use(cors({
  origin: corsOrigin,
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
app.use('/api/customer/verify', authLimiter);

// Stricter rate limit on sensitive endpoints
app.use('/api/vendor/award', sensitiveLimiter);
app.use('/api/vendor/redeem', sensitiveLimiter);
app.use('/api/admin', sensitiveLimiter);

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

// Health check for deployment/monitoring
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback: serve frontend for non-API routes (after static and API)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

seedAsync()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database seed failed:', err);
    process.exit(1);
  });
