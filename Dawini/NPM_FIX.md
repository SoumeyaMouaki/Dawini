# 🔧 Correction du conflit de dépendances npm

## Problème

Erreur lors du build sur Render :
```
npm error ERESOLVE could not resolve
npm error While resolving: react-leaflet@5.0.0
npm error Found: react@18.3.1
npm error Could not resolve dependency:
npm error peer react@"^19.0.0" from react-leaflet@5.0.0
```

## Cause

`react-leaflet@5.0.0` nécessite React 19, mais le projet utilise React 18. De plus, `react-leaflet` n'est pas utilisé dans le code (le projet utilise `leaflet` directement).

## Solution appliquée

1. **Suppression de `react-leaflet`** du `package.json` car il n'est pas utilisé
2. **Ajout de `--legacy-peer-deps`** dans la commande de build pour gérer d'éventuels autres conflits

## Fichiers modifiés

- `package.json` : Suppression de `"react-leaflet": "^5.0.0"`
- `render.yaml` : Mise à jour de la commande de build avec `--legacy-peer-deps`

## Commandes de build

### Avant
```bash
npm install && npm run build
```

### Après
```bash
npm install --legacy-peer-deps && npm run build
```

## Vérification locale

Pour tester localement avant de déployer :

```bash
cd Dawini
npm install --legacy-peer-deps
npm run build
```

## Si le problème persiste

1. Supprimez `node_modules` et `package-lock.json`
2. Réinstallez avec `npm install --legacy-peer-deps`
3. Vérifiez que le build fonctionne : `npm run build`
4. Commitez et poussez les changements

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
git add package.json package-lock.json
git commit -m "Fix npm dependency conflicts"
git push
```

