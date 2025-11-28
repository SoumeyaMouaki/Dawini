# 🔧 Correction de l'erreur Rollup sur Render

## Problème

Erreur lors du build sur Render :
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
npm has a bug related to optional dependencies
```

## Cause

C'est un problème connu avec npm et les dépendances optionnelles de Rollup. Les modules natifs de Rollup ne sont pas correctement installés lors du build sur Render.

## Solutions appliquées

### 1. Nettoyage et réinstallation complète
La commande de build nettoie maintenant `node_modules` et `package-lock.json` avant l'installation pour forcer une réinstallation complète.

### 2. Version de Node.js
Spécification de Node.js 20 (au lieu de 22) pour une meilleure compatibilité avec Rollup.

### 3. Commande de build mise à jour
```bash
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build
```

## Fichiers modifiés

- `render.yaml` : 
  - Ajout de `nodeVersion: 20`
  - Mise à jour de la commande de build avec nettoyage
- `.nvmrc` : Créé pour spécifier Node.js 20

## Configuration dans Render

Si vous configurez manuellement dans Render :

1. **Node Version** : `20` (ou laissez Render détecter depuis `.nvmrc`)
2. **Build Command** : `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build`

## Alternative : Configuration manuelle dans Render

Si le problème persiste avec le render.yaml :

1. Allez dans **Settings** de votre service frontend
2. Dans **Build & Deploy** :
   - **Node Version** : Sélectionnez `20` ou `18`
   - **Build Command** : `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build`

## Vérification locale

Pour tester localement :

```bash
cd Dawini
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

## Si le problème persiste

1. **Vérifiez la version de Node.js** : Render utilise Node 22 par défaut, ce qui peut causer des problèmes. Spécifiez Node 20.

2. **Forcez la réinstallation** : La commande de build nettoie maintenant automatiquement avant d'installer.

3. **Vérifiez les logs** : Les logs de Render devraient montrer que le nettoyage et la réinstallation se font correctement.

4. **Alternative avec yarn** : Si npm continue à poser problème, vous pouvez essayer yarn :
   ```bash
   npm install -g yarn
   yarn install
   yarn build
   ```

## Notes

- Le nettoyage de `node_modules` et `package-lock.json` force npm à réinstaller toutes les dépendances, y compris les dépendances optionnelles de Rollup.
- Node.js 20 est plus stable avec Vite/Rollup que Node.js 22.
- `--legacy-peer-deps` évite les conflits de dépendances peer.

