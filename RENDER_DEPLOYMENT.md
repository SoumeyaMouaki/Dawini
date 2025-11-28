# Guide de déploiement sur Render

Ce guide vous explique comment déployer l'application Dawini sur Render.

## Prérequis

1. Un compte Render (gratuit disponible sur [render.com](https://render.com))
2. Un compte MongoDB Atlas (gratuit) ou une base de données MongoDB
3. Un compte GitHub (pour connecter le repository)

## Architecture

L'application se compose de deux services :
- **Backend** : API Node.js/Express
- **Frontend** : Application React/Vite

## Étape 1 : Préparer MongoDB

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (choisissez le plan gratuit M0)
3. Créez un utilisateur de base de données
4. Ajoutez l'adresse IP `0.0.0.0/0` dans Network Access (pour permettre l'accès depuis Render)
5. Copiez la chaîne de connexion MongoDB (format : `mongodb+srv://username:password@cluster.mongodb.net/dawini?retryWrites=true&w=majority`)

## Étape 2 : Déployer le Backend

### Option A : Utiliser render.yaml (Recommandé)

1. Connectez votre repository GitHub à Render
2. Dans le dashboard Render, allez dans "New" > "Blueprint"
3. Sélectionnez votre repository
4. Render détectera automatiquement le fichier `render.yaml` dans `Dawini-backend/`
5. Configurez les variables d'environnement suivantes dans le dashboard Render :

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dawini?retryWrites=true&w=majority
   JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
   FRONTEND_URL=https://votre-frontend.onrender.com
   NODE_ENV=production
   PORT=10000
   ```

6. Cliquez sur "Apply" pour déployer

### Option B : Configuration manuelle

1. Dans Render, cliquez sur "New" > "Web Service"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `dawini-backend`
   - **Environment** : `Node`
   - **Root Directory** : `Dawini-backend` ⚠️ **IMPORTANT : Ce champ est crucial !**
   - **Build Command** : `npm install`
   - **Start Command** : `npm run start:simple`
   - **Plan** : Free (ou Starter pour de meilleures performances)

4. Ajoutez les variables d'environnement (voir ci-dessus)

5. Cliquez sur "Create Web Service"

### Variables d'environnement Backend

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Secret pour signer les tokens JWT | `votre-secret-securise` |
| `FRONTEND_URL` | URL du frontend (pour CORS) | `https://dawini-frontend.onrender.com` |
| `NODE_ENV` | Environnement | `production` |
| `PORT` | Port du serveur | `10000` (Render définit automatiquement) |
| `SMTP_HOST` | (Optionnel) Serveur SMTP pour emails | `smtp.gmail.com` |
| `SMTP_PORT` | (Optionnel) Port SMTP | `587` |
| `SMTP_USER` | (Optionnel) Email SMTP | `votre-email@gmail.com` |
| `SMTP_PASS` | (Optionnel) Mot de passe SMTP | `votre-app-password` |
| `GOOGLE_MAPS_API_KEY` | (Optionnel) Clé API Google Maps | `votre-cle-api` |

## Étape 3 : Déployer le Frontend

### Option A : Utiliser render.yaml

1. Dans Render, créez un nouveau service "Static Site"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `dawini-frontend`
   - **Root Directory** : `Dawini`
   - **Build Command** : `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory** : `dist`

4. Ajoutez la variable d'environnement :
   ```
   VITE_API_BASE_URL=https://dawini-backend.onrender.com
   ```

5. Cliquez sur "Create Static Site"

### Option B : Configuration manuelle

1. Dans Render, cliquez sur "New" > "Static Site"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `dawini-frontend`
   - **Root Directory** : `Dawini` ⚠️ **IMPORTANT : Ce champ est crucial !**
   - **Node Version** : `20` (recommandé, au lieu de 22 par défaut)
   - **Build Command** : `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build`
   - **Publish Directory** : `dist`

4. Ajoutez la variable d'environnement :
   ```
   VITE_API_BASE_URL=https://votre-backend.onrender.com
   ```

5. Cliquez sur "Create Static Site"

### Variables d'environnement Frontend

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL de l'API backend | `https://dawini-backend.onrender.com` |

## Étape 4 : Mettre à jour les URLs

Après le déploiement :

1. **Backend** : Notez l'URL du backend (ex: `https://dawini-backend.onrender.com`)
2. **Frontend** : Mettez à jour la variable `FRONTEND_URL` dans le backend avec l'URL du frontend
3. **Frontend** : Mettez à jour la variable `VITE_API_BASE_URL` dans le frontend avec l'URL du backend

## Étape 5 : Vérifier le déploiement

1. **Backend** : Visitez `https://votre-backend.onrender.com/api/health`
   - Vous devriez voir : `{"status":"OK","message":"Dawini API is running"}`

2. **Frontend** : Visitez l'URL du frontend
   - L'application devrait se charger correctement

## ⚠️ Problème courant : Root Directory manquant

Si vous voyez l'erreur :
```
Service Root Directory « /opt/render/project/src/backend » est manquant.
```

**Solution** : Vérifiez que le **Root Directory** est bien configuré dans les Settings de votre service Render :
- Backend : `Dawini-backend`
- Frontend : `Dawini`

Voir le fichier `RENDER_FIX.md` pour plus de détails.

## Dépannage

### Erreur de dépendances npm (ERESOLVE)

Si vous voyez une erreur comme :
```
npm error ERESOLVE could not resolve
npm error Conflicting peer dependency
```

**Solution** : La commande de build utilise déjà `--legacy-peer-deps` pour résoudre les conflits de dépendances. Si le problème persiste :
1. Vérifiez que la commande de build inclut `--legacy-peer-deps`
2. Assurez-vous que `react-leaflet` a été supprimé du `package.json` (il n'est pas utilisé dans le code)

### Backend ne démarre pas

- Vérifiez les logs dans le dashboard Render
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que MongoDB Atlas autorise les connexions depuis `0.0.0.0/0`

### Erreur Rollup (@rollup/rollup-linux-x64-gnu not found)

Si vous voyez une erreur comme :
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

**Solution** :
1. Vérifiez que la commande de build nettoie et réinstalle : `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build`
2. Spécifiez Node.js version 20 dans les Settings (au lieu de 22 par défaut)
3. Voir `ROLLUP_FIX.md` pour plus de détails

### Frontend ne peut pas se connecter au backend

- Vérifiez que `VITE_API_BASE_URL` est correctement défini
- Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend
- Vérifiez les logs du backend pour les erreurs CORS

### Erreurs CORS

- Assurez-vous que `FRONTEND_URL` dans le backend correspond exactement à l'URL du frontend (avec `https://`)
- Vérifiez que le backend redémarre après la modification de `FRONTEND_URL`

### Base de données vide

- Les données de développement ne sont pas incluses dans la production
- Vous devrez créer des utilisateurs via l'API ou importer des données de test

## Notes importantes

1. **Plan gratuit** : Render met en veille les services gratuits après 15 minutes d'inactivité. Le premier démarrage peut prendre 30-60 secondes.

2. **MongoDB Atlas** : Le plan gratuit (M0) est suffisant pour le développement et les petits projets.

3. **Variables d'environnement** : Ne commitez jamais les fichiers `.env` dans Git. Utilisez les variables d'environnement de Render.

4. **HTTPS** : Render fournit automatiquement HTTPS pour tous les services.

5. **Logs** : Consultez les logs dans le dashboard Render pour déboguer les problèmes.

## Support

Pour plus d'aide :
- [Documentation Render](https://render.com/docs)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)

