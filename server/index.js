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

// Configuration de la session avec PostgreSQL
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

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
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}\n`);
  console.log('🔗 Connexion à OBS en cours...\n');
  
  // Essayer de se connecter à OBS au démarrage
  const obsConnected = await obsClient.connect();
  if (obsConnected) {
    console.log('✅ OBS connecté!\n');
  } else {
    console.log('⚠️  OBS non disponible (continuez quand même, reconnexion automatique)\n');
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

