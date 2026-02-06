# 🚀 Déploiement sur Vercel

## Configuration pour Vercel

⚠️ **Important** : Vercel n'est pas optimal pour cette app car :
- Sessions en mémoire (pas persistantes)
- WebSockets limités
- Pas de support pour les connexions persistantes à OBS

**Mais ça marche !** Voici comment :

---

## 📋 Étapes de déploiement

### 1. Pusher sur GitHub

```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### 2. Connecter à Vercel

1. Aller sur [Vercel.com](https://vercel.com)
2. **Import Project** → Sélectionner ton repo GitHub
3. Vercel détecte automatiquement la config

### 3. Ajouter les variables d'environnement

Dans **Vercel Dashboard** → **Settings** → **Environment Variables** :

```
NODE_ENV=production
DATABASE_URL=postgresql://... (de Railway ou autre)
SESSION_SECRET=VOTRE_CLE_LONGUE_ET_SECUISEE
OBS_ADDRESS=ws://votre-ip:4444
OBS_PASSWORD=
CLIENT_URL=https://votre-app.vercel.app
```

### 4. Ajouter PostgreSQL

Options :
- **Vercel Postgres** (recommandé, intégré)
- **Railway** (ce qu'on a avant)
- **Supabase** (gratuit)

Si tu utilises Vercel Postgres :
```
DATABASE_URL=postgresql://... (fourni par Vercel)
```

### 5. Déployer

Vercel redéploie automatiquement à chaque git push ! 🎉

---

## ⚙️ Variables d'environnement requises

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL PostgreSQL |
| `SESSION_SECRET` | Clé longue aléatoire |
| `OBS_ADDRESS` | `ws://votre-ip:4444` |
| `CLIENT_URL` | Votre domaine Vercel |

---

## ⚠️ Limitations sur Vercel

1. **Sessions** : Stockées en mémoire (pertes lors du redéploiement)
   - **Solution** : Utiliser Redis/Upstash pour les sessions
   
2. **WebSocket OBS** : Peut être limité
   - **Solution** : Ngrok pour exposer OBS
   
3. **Pas de serveur persistent**
   - Les alertes OBS ne sont envoyées que lors des requêtes HTTP

---

## ✅ Pour une meilleure expérience

Je recommande quand même :
- **Fly.io** (meilleur WebSocket support)
- **Railway** (ce qu'on a maintenant - parfait !)

Mais Vercel fonctionne pour le MVP ! 🚀

---

## 🔗 URL finale

Une fois déployé : `https://votre-app.vercel.app`

Tes utilisateurs peuvent accéder et s'inscrire !
