const express = require('express');
const router = express.Router();
const db = require('../database');
const obsClient = require('../obs-client');

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
}

// Envoyer une alerte
router.post('/send', requireAuth, async (req, res) => {
  const { action, driver } = req.body;

  if (!action || !driver) {
    return res.status(400).json({ error: 'Action et driver requis' });
  }

  try {
    // Sauvegarder dans la base de données
    db.saveAlert(req.session.userId, action, driver, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
      }

      // Envoyer l'alerte à OBS
      obsClient.createAlert(action, driver);

      res.json({
        success: true,
        alertId: result.id,
        message: `Alerte envoyée: ${driver} - ${action}`
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir l'historique des alertes
router.get('/history', requireAuth, (req, res) => {
  db.getAlertHistory(req.session.userId, 50, (err, alerts) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
    res.json({ alerts });
  });
});

// Obtenir l'état de connexion OBS
router.get('/obs-status', (req, res) => {
  const status = obsClient.getConnectionStatus();
  res.json(status);
});

module.exports = router;
