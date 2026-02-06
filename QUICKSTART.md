# 📝 Quick Start Guide

## Installation locale

```bash
# 1. Cloner/télécharger le projet
cd f1-obs-alerts

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Ajuster .env pour votre setup local
# (DATABASE_URL, OBS_ADDRESS, etc.)

# 5. Lancer le serveur
npm start

# Accéder à http://localhost:3000
```

## Configuration OBS

1. **Lancer OBS Studio**
2. **Outils** → **WebSocket Server** (ou **obs-websocket Settings**)
3. Cocher **Enable WebSocket server**
4. Mettre le port : `4444`
5. Dans `.env`, vérifier : `OBS_ADDRESS=ws://localhost:4444`

## Base de données locale

Pour le développement local, il faut PostgreSQL :

```bash
# macOS (avec Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### Créer une base locale

```bash
createdb f1_alerts

# Dans .env
DATABASE_URL=postgresql://localhost/f1_alerts
```

## Tester l'application

1. Accéder à `http://localhost:3000`
2. S'inscrire avec un pseudo et mot de passe
3. Sélectionner une action F1
4. Choisir un pilote
5. L'alerte s'affiche sur OBS ! 🎉

## Structure du projet

```
f1-obs-alerts/
├── server/
│   ├── index.js              # Serveur principal
│   ├── database.js           # Configuration PostgreSQL
│   ├── obs-client.js         # Intégration OBS
│   └── routes/
│       ├── auth.js           # Login/Register
│       └── alerts.js         # Envoi d'alertes
├── public/
│   ├── index.html            # Page de connexion
│   ├── dashboard.html        # Interface principale
│   ├── css/style.css         # Styles
│   └── js/
│       ├── auth.js           # Logique connexion
│       └── dashboard.js      # Logique alertes
├── .env.example              # Variables d'env
├── package.json              # Dépendances
└── DEPLOYMENT.md             # Guide Railway
```

## Variables d'environnement

```
PORT=3000                           # Port du serveur
NODE_ENV=development                # development/production
DATABASE_URL=...                    # URL PostgreSQL
SESSION_SECRET=...                  # Clé de session
OBS_ADDRESS=ws://localhost:4444     # Adresse OBS
OBS_PASSWORD=                       # Mot de passe OBS (optionnel)
CLIENT_URL=http://localhost:3000    # URL du client
```

## Commands

```bash
npm start       # Démarrer le serveur
npm run dev     # Démarrer avec nodemon (dev)
npm install     # Installer les dépendances
```

## Besoin d'aide ?

Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour le déploiement sur Railway !
