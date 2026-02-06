# F1 OBS Alerts

Une application web pour envoyer des alertes personnalisées sur OBS lors de vos streams F1.

## Fonctionnalités

- ✅ Connexion utilisateur (pseudo/mot de passe)
- ✅ Sélection d'actions (Rentre aux stands, Ailerons cassés, etc.)
- ✅ Sélection de pilote parmi 20 pilotes F1
- ✅ Intégration OBS WebSocket pour les alertes en direct
- ✅ Designs personnalisés pour chaque type d'alerte

## Installation

1. **Cloner ou créer le projet**
   ```bash
   npm install
   ```

2. **Configurer OBS**
   - Aller dans Outils > Paramètres > WebSocket Server
   - Activer le WebSocket Server
   - Noter le port (par défaut 4444)

3. **Lancer le serveur**
   ```bash
   npm start
   # ou en mode développement
   npm run dev
   ```

4. **Accéder à l'application**
   - Ouvrir http://localhost:3000

## Structure du projet

```
├── server/
│   ├── index.js              # Serveur Express
│   ├── database.js           # Initialisation SQLite
│   ├── routes/
│   │   ├── auth.js          # Routes d'authentification
│   │   └── alerts.js        # Routes des alertes
│   └── obs-client.js        # Client OBS WebSocket
├── public/
│   ├── index.html           # Page de connexion
│   ├── dashboard.html       # Tableau de bord
│   ├── css/
│   │   └── style.css        # Styles
│   └── js/
│       ├── auth.js          # Logique de connexion
│       └── dashboard.js     # Logique du tableau de bord
└── package.json
```

## Configuration

Éditez `server/config.js` pour adapter à votre OBS :
- Port OBS WebSocket
- Adresse du serveur
- Format des alertes

## Utilisation

1. Se connecter avec le pseudo et mot de passe
2. Sélectionner le type d'action (Rentre aux stands, Ailerons cassés, etc.)
3. Choisir le pilote F1 concerné
4. L'alerte s'affiche sur votre stream OBS
