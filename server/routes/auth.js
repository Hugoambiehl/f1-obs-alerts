const express = require('express');
const router = express.Router();
const db = require('../database');

// Inscription
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  db.createUser(username, password, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
      }
      return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true, user });
  });
});

// Connexion
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  db.getUserByUsername(username, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (!db.verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true, user: { id: user.id, username: user.username } });
  });
});

// Déconnexion
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.json({ success: true });
  });
});

// Vérifier la session
router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
