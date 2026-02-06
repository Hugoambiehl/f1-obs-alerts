const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const session = require('express-session');
const path = require('path');
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

// Servir les fichiers statiques (public)
// Sur Vercel, le chemin doit être relatif à la racine du projet
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

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

// Servir index.html par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicPath, 'dashboard.html'));
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
