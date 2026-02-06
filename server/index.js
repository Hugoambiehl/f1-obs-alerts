const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const alertsRoutes = require('./routes/alerts');
const obsClient = require('./obs-client');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Initialiser la base de données
require('./database');

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Configuration de la session
if (IS_PRODUCTION) {
  // PostgreSQL en production
  const pgSession = require('connect-pg-simple')(session);
  app.use(session({
    store: new pgSession({
      pool: db.pool,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
} else {
  // Sessions en mémoire pour le développement (SQLite)
  app.use(session({
    secret: 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);

// Route pour servir le dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`\n🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📊 Mode: ${IS_PRODUCTION ? 'PRODUCTION (PostgreSQL)' : 'DÉVELOPPEMENT (SQLite)'}\n`);
  console.log('🔗 Connexion à OBS en cours...\n');
  
  // Essayer de se connecter à OBS au démarrage
  const obsConnected = await obsClient.connect();
  if (obsConnected) {
    console.log('✅ OBS connecté!\n');
  } else {
    console.log('⚠️  OBS non disponible (continuez quand même)\n');
  }
});

// Gestion de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await obsClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await obsClient.disconnect();
  process.exit(0);
});

