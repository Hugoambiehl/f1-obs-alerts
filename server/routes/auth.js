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

// Vérifier si un utilisateur existe
router.post('/check-username', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username requis' });
  }

  db.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ exists: !!user });
  });
});

// Réinitialiser le mot de passe
router.post('/reset-password', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et password requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  db.getUserByUsername(username, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le mot de passe
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { pool } = db;
    pool.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, username],
      (error) => {
        if (error) {
          return res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
        }
        res.json({ success: true, message: 'Mot de passe réinitialisé' });
      }
    );
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
