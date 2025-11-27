# 🔧 Correction du problème de déploiement Render

## Problème rencontré

```
==> Service Root Directory « /opt/render/project/src/backend » est manquant.
builder.sh : ligne 51 : cd : /opt/render/project/src/backend : Aucun fichier ni répertoire de ce type
```

## Solution

Le problème vient de la configuration du **Root Directory** dans Render. Votre repository a la structure suivante :

```
Dawini/
├── Dawini/          (Frontend)
└── Dawini-backend/  (Backend)
```

## Solution 1 : Configuration manuelle dans Render (Recommandé)

### Pour le Backend :

1. Allez dans votre service backend sur Render
2. Cliquez sur **Settings**
3. Dans la section **Build & Deploy**, trouvez **Root Directory**
4. Définissez le Root Directory à : **`Dawini-backend`**
5. Vérifiez que les commandes sont :
   - **Build Command** : `npm install`
   - **Start Command** : `npm run start:simple`
6. Cliquez sur **Save Changes**

### Pour le Frontend :

1. Allez dans votre service frontend sur Render
2. Cliquez sur **Settings**
3. Dans la section **Build & Deploy**, trouvez **Root Directory**
4. Définissez le Root Directory à : **`Dawini`**
5. Vérifiez que les commandes sont :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
6. Cliquez sur **Save Changes**

## Solution 2 : Utiliser render.yaml (Alternative)

Si vous utilisez un Blueprint Render, les fichiers `render.yaml` ont été mis à jour avec le `rootDir` correct. 

**Important** : Si vous créez un nouveau service depuis zéro :

1. Créez un nouveau **Web Service** (pas un Blueprint)
2. Connectez votre repository GitHub
3. Configurez manuellement comme indiqué dans la Solution 1

## Vérification de la structure

Assurez-vous que votre repository GitHub a bien cette structure :

```
Dawini/
├── Dawini/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── render.yaml
├── Dawini-backend/
│   ├── routes/
│   ├── models/
│   ├── server.js
│   ├── package.json
│   └── render.yaml
└── README.md
```

## Commandes de build et démarrage

### Backend
- **Root Directory** : `Dawini-backend`
- **Build Command** : `npm install`
- **Start Command** : `npm run start:simple`

### Frontend
- **Root Directory** : `Dawini`
- **Build Command** : `npm install && npm run build`
- **Publish Directory** : `dist`

## Variables d'environnement

N'oubliez pas de configurer les variables d'environnement dans Render :

### Backend
- `MONGODB_URI` - URI de connexion MongoDB
- `JWT_SECRET` - Secret JWT
- `FRONTEND_URL` - URL du frontend (ex: `https://dawini-frontend.onrender.com`)
- `NODE_ENV` - `production`
- `PORT` - Render définit automatiquement, mais vous pouvez mettre `10000`

### Frontend
- `VITE_API_BASE_URL` - URL du backend (ex: `https://dawini-backend.onrender.com`)

## Après la correction

1. Redéployez le service (Render devrait détecter les changements automatiquement)
2. Vérifiez les logs pour confirmer que le build démarre correctement
3. Testez l'endpoint de santé : `https://votre-backend.onrender.com/api/health`

## Dépannage supplémentaire

Si le problème persiste :

1. **Vérifiez que les fichiers sont bien commités sur GitHub**
   ```bash
   git add .
   git commit -m "Fix render configuration"
   git push
   ```

2. **Vérifiez les logs de build dans Render**
   - Allez dans votre service > Logs
   - Cherchez les erreurs de build

3. **Vérifiez que package.json existe dans chaque dossier**
   - `Dawini-backend/package.json` doit exister
   - `Dawini/package.json` doit exister

4. **Si vous utilisez un monorepo**, assurez-vous que Render peut accéder aux sous-dossiers

## Support

Si le problème persiste après ces corrections, vérifiez :
- Les logs de build dans Render
- Que tous les fichiers sont bien dans le repository GitHub
- Que les noms de dossiers correspondent exactement (sensible à la casse)

