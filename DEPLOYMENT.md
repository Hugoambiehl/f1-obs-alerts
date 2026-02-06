# 🚀 Guide de déploiement sur Railway

## 1. Préparation du projet

Le projet est maintenant prêt pour Railway ! Voici ce qui a été modifié :

- ✅ **PostgreSQL** remplace SQLite (plus robuste)
- ✅ **Variables d'environnement** configurables
- ✅ **Sessions sécurisées** stockées en base de données
- ✅ **Procfile** et **railway.json** pour le déploiement

## 2. Créer un compte Railway

1. Aller sur [Railway.app](https://railway.app)
2. Cliquer sur **"Start a New Project"**
3. Connecter votre compte GitHub (ou créer un compte)

## 3. Déployer le projet

### Option A : Depuis GitHub (recommandé)

1. **Push sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_USERNAME/f1-obs-alerts.git
   git push -u origin main
   ```

2. Dans Railway :
   - Cliquer **"New Project"** → **"Deploy from GitHub"**
   - Sélectionner votre repo `f1-obs-alerts`
   - Railway détecte automatiquement Node.js
   - Attendre le déploiement (2-3 min)

### Option B : Avec Railway CLI (plus direct)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

## 4. Configurer les variables d'environnement

### Sur Railway Dashboard :

1. Aller dans votre projet → **Variables**
2. Ajouter les variables :

```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://... (Railway crée automatiquement)
SESSION_SECRET=VOTRE_CLE_SECRETE_TRES_LONGUE
OBS_ADDRESS=ws://VOTRE_IP:4444
OBS_PASSWORD=votre_mot_de_passe_obs
CLIENT_URL=https://VOTRE_URL.railway.app
```

### Créer une clé seconde robuste :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Ajouter une base de données PostgreSQL

Dans Railway :

1. **New** → **Database** → **PostgreSQL**
2. Railway crée automatiquement `DATABASE_URL` avec les bons identifiants
3. Les tables se créent automatiquement au démarrage

## 6. Connecter OBS

L'application envoie les alertes à votre OBS local. Donc :

1. **Votre IP publique** doit être accessible depuis Railway
2. Ou utiliser un **tunnel** (ngrok) pour OBS :

```bash
# Installer ngrok
# https://ngrok.com/

# Lancer ngrok
ngrok tcp 4444

# Copier l'URL (ex: tcp://2.tcp.ngrok.io:12345)
# Mettre dans OBS_ADDRESS sur Railway
```

## 7. Votre URL en ligne

Une fois déployé, vous aurez une URL comme :

```
https://f1-obs-alerts-prod.railway.app
```

Vos utilisateurs peuvent accéder depuis n'importe où ! 🎉

## 8. Troubleshooting

### OBS non connecté ?
- Vérifier que OBS WebSocket est activé
- Vérifier l'IP/port dans les variables d'environnement
- Utiliser ngrok si OBS est local

### Base de données ne démarre pas ?
- Vérifier que PostgreSQL est ajouté dans Railway
- Vérifier la DATABASE_URL

### Sessions ne marchent pas ?
- Vérifier que `connect-pg-simple` est installé
- Attendre que les tables se créent (1-2 min au démarrage)

## 9. Mise à jour du code

Pour mettre à jour après des changements :

```bash
git add .
git commit -m "Mes changements"
git push origin main

# Railway redéploie automatiquement !
```

---

**Besoin d'aide ?** Contactez-moi ! 🚀
