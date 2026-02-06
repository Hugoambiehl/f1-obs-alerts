const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const alertsRoutes = require('../server/routes/alerts');
const obsClient = require('../server/obs-client');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la session (mémoire pour Vercel - pas idéal mais compatible)
app.use(session({
  secret: process.env.SESSION_SECRET || 'vercel-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
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
  res.json({ status: 'OK' });
});

// Gérer OBS (essai de connexion au démarrage)
(async () => {
  try {
    await obsClient.connect();
  } catch (e) {
    console.log('OBS non disponible');
  }
})();

// Export pour Vercel
module.exports = serverless(app);
