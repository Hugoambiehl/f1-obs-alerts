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

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (public)
app.use(express.static(path.join(__dirname, 'public')));

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

// Servir index.html par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

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
