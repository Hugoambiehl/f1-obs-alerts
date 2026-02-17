const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./server/routes/auth');
const alertsRoutes = require('./server/routes/alerts');
const obsClient = require('./server/obs-client');

const app = express();

// middleware de debug pour logguer chaque requête
app.use((req, res, next) => {
  console.log('📥 requête', req.method, req.url);
  next();
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// note: static files are served automatically by Vercel from /public
const publicPath = path.join(__dirname, 'public');
console.log('📁 Chemin public (untouched):', publicPath);

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug route for environment info (API path)
app.get('/api/debug', (req, res) => {
  const { NODE_ENV, DATABASE_URL, SESSION_SECRET, OBS_ADDRESS, CLIENT_URL } = process.env;
  res.json({
    NODE_ENV,
    DATABASE_URL: DATABASE_URL ? DATABASE_URL.replace(/:\/\/.*@/, '://***@') : null,
    SESSION_SECRET: SESSION_SECRET ? '***' : null,
    OBS_ADDRESS,
    CLIENT_URL
  });
});

// no SPA fallback here; static files and HTML served by Vercel directly
// any non-/api route will be handled by Vercel's public folder.

// Gérer OBS (essai de connexion au démarrage)
(async () => {
  try {
    await obsClient.connect();
  } catch (e) {
    console.log('OBS non disponible au démarrage');
  }
})();

// Export pour Vercel avec serverless-http
module.exports = serverless(app);
