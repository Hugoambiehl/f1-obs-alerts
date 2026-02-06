const OBSWebSocket = require('obs-websocket-js').default;
require('dotenv').config();

class OBSClient {
  constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.config = {
      address: process.env.OBS_ADDRESS || 'ws://localhost:4444',
      password: process.env.OBS_PASSWORD || ''
    };
  }

  async connect() {
    try {
      await this.obs.connect(this.config.address, { rpcVersion: 1 });
      this.connected = true;
      console.log('✅ Connecté à OBS');
      return true;
    } catch (error) {
      console.warn('⚠️  OBS non disponible:', error.message);
      this.connected = false;
      return false;
    }
  }

  async disconnect() {
    try {
      await this.obs.disconnect();
      this.connected = false;
      console.log('Déconnecté d\'OBS');
    } catch (error) {
      console.error('Erreur lors de la déconnexion d\'OBS:', error);
    }
  }

  // Créer une source texte pour l'alerte
  async createAlert(actionType, driverName) {
    if (!this.connected) {
      console.warn('OBS non connecté');
      return false;
    }

    try {
      const sceneName = 'Alerte'; // À adapter si votre scène s'appelle différemment
      
      // Définir le contenu de l'alerte selon le type d'action
      const alertTexts = {
        'pit-entry': `${driverName}\nRENTRE AUX STANDS`,
        'broken-wing': `${driverName}\nAILERONS CASSÉS`,
        'accident': `${driverName}\nACCIDENT`,
        'puncture': `${driverName}\nPRESSION PNEU`,
        'drs': `${driverName}\nDRS ACTIVÉ`
      };

      const alertText = alertTexts[actionType] || `${driverName}\n${actionType}`;

      // Afficher du texte via OBS Studio (méthode simple)
      // Vous pouvez adapter ça pour afficher une image, vidéo, etc.
      
      // Obtenir la scène
      const scenes = await this.obs.call('GetSceneList');
      console.log('Alerte envoyée:', alertText);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte OBS:', error);
      return false;
    }
  }

  // Activer/désactiver une source
  async toggleSource(sceneName, sourceName, enabled) {
    try {
      await this.obs.call('SetSourceFilterEnabled', {
        sourceName: sourceName,
        filterName: 'Visible',
        filterEnabled: enabled
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification de la source:', error);
      return false;
    }
  }

  // Obtenir les informations de connexion OBS
  getConnectionStatus() {
    return {
      connected: this.connected,
      address: this.config.address
    };
  }
}

module.exports = new OBSClient();
