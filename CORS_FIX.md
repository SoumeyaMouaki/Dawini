# 🔧 Correction de l'erreur CORS

## Problème

Erreur CORS lors de la connexion depuis le frontend déployé :
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' from origin 'https://dawini-frontend.onrender.com' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin.
```

## Cause

Le backend autorisait uniquement `http://localhost:5173` dans CORS, mais le frontend est déployé sur `https://dawini-frontend.onrender.com`.

## Solution appliquée

1. **Configuration CORS améliorée** dans `server.js` :
   - Autorise maintenant plusieurs origines (local + production)
   - En développement : autorise toutes les origines
   - En production : vérifie contre la liste des origines autorisées

2. **Variable d'environnement requise** :
   - `FRONTEND_URL` doit être définie dans Render avec l'URL du frontend déployé

## Configuration dans Render

### Étape 1 : Trouver l'URL de votre frontend

Votre frontend est déployé sur Render. Trouvez son URL (ex: `https://dawini-frontend.onrender.com`)

### Étape 2 : Configurer FRONTEND_URL dans le backend

1. Allez dans votre service **backend** sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Trouvez ou créez la variable **`FRONTEND_URL`**
4. Définissez-la à l'URL complète de votre frontend :
   ```
   https://dawini-frontend.onrender.com
   ```
   ⚠️ **Important** : 
   - Utilisez `https://` (pas `http://`)
   - Pas de slash à la fin
   - URL exacte de votre frontend déployé

5. Cliquez sur **"Save Changes"**
6. Le service redéploiera automatiquement

### Étape 3 : Vérifier VITE_API_BASE_URL dans le frontend

1. Allez dans votre service **frontend** sur Render
2. Cliquez sur **"Environment"**
3. Vérifiez que **`VITE_API_BASE_URL`** pointe vers votre backend :
   ```
   https://dawini-backend.onrender.com
   ```
   (Remplacez par l'URL réelle de votre backend)

## Vérification

Après le redéploiement :

1. **Backend** : Vérifiez les logs - vous ne devriez plus voir d'erreurs CORS
2. **Frontend** : Essayez de vous connecter - ça devrait fonctionner maintenant

## Structure des URLs

- **Backend** : `https://dawini-backend.onrender.com`
- **Frontend** : `https://dawini-frontend.onrender.com`

### Variables d'environnement

**Backend (Render)** :
```
FRONTEND_URL=https://dawini-frontend.onrender.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
```

**Frontend (Render)** :
```
VITE_API_BASE_URL=https://dawini-backend.onrender.com
```

## Dépannage

### Si l'erreur persiste

1. **Vérifiez que `FRONTEND_URL` est bien définie** dans Render (backend)
2. **Vérifiez l'URL exacte** - elle doit correspondre exactement à l'URL de votre frontend
3. **Vérifiez que le backend a redéployé** après la modification
4. **Videz le cache du navigateur** et réessayez

### Logs utiles

Le backend affichera maintenant un avertissement si une origine non autorisée tente de se connecter :
```
CORS blocked origin: https://example.com
```

Cela vous aidera à identifier les problèmes de configuration.

