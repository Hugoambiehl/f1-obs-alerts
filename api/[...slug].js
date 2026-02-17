const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const alertsRoutes = require('../server/routes/alerts');

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production' && !!process.env.DATABASE_URL;

// logging
app.use((req, res, next) => {
  console.log('[API] ', req.method, req.originalUrl, '->', req.path);
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

// mount routers without "/api" prefix, because Vercel passes the full path
app.use('/auth', authRoutes);
app.use('/alerts', alertsRoutes);

// simple health/debug
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/debug', (req, res) => {
  const { NODE_ENV, DATABASE_URL, SESSION_SECRET, OBS_ADDRESS, CLIENT_URL } = process.env;
  res.json({
    NODE_ENV,
    DATABASE_URL: DATABASE_URL ? DATABASE_URL.replace(/:\/\/.*@/, '://***@') : null,
    SESSION_SECRET: SESSION_SECRET ? '***' : null,
    OBS_ADDRESS,
    CLIENT_URL
  });
});

// export the serverless handler
module.exports = serverless(app);
