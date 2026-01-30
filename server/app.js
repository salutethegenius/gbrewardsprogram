const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const enforce = require('express-sslify');
const cors = require('cors');

// Load env and DB (creates tables + seed admin)
require('./database/config');

const admin_auth = require('./auth/admin');
const user_auth = require('./auth/user');
const vendor_auth = require('./auth/vendor');
const customer_auth = require('./auth/customer');
const routes = require('./routes/routes');
const vendor_routes = require('./routes/vendor');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4040;

if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json());
app.use(cookieParser());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
  next();
});

app.use(admin_auth);
app.use(user_auth);
app.use(vendor_auth);
app.use(customer_auth);
app.use(routes);
app.use(vendor_routes);

// SPA fallback: serve frontend for non-API routes (after static and API)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
