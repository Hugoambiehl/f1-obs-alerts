const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const alertsRoutes = require('../server/routes/alerts');

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// basic logging
app.use((req, res, next) => {
  console.log('[API] ', req.method, req.path);
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = serverless(app);
