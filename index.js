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
const publicPath = path.join(__dirname, 'public');
console.log('📁 Chemin public:', publicPath);
app.use(express.static(publicPath));

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
  console.log('GET / - sending index.html');
  const filePath = path.join(__dirname, 'public', 'index.html');
  console.log('📄 Chemin fichier:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) console.error('Erreur sendFile:', err);
  });
});

app.get('/dashboard', (req, res) => {
  console.log('GET /dashboard - sending dashboard.html');
  const filePath = path.join(__dirname, 'public', 'dashboard.html');
  res.sendFile(filePath, (err) => {
    if (err) console.error('Erreur sendFile:', err);
  });
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
