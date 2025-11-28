# 🗄️ Configuration MongoDB Atlas pour Dawini

## Pourquoi MongoDB Atlas ?

Pour déployer votre application sur Render, vous devez utiliser **MongoDB Atlas** (cloud) car :
- Render ne fournit pas de base de données MongoDB locale
- MongoDB Atlas est gratuit pour commencer (plan M0)
- C'est la solution recommandée pour les déploiements cloud

## 📋 Étape 1 : Créer un compte MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Créez un compte gratuit (ou connectez-vous si vous en avez déjà un)
3. Complétez le formulaire d'inscription

## 📋 Étape 2 : Créer un cluster

1. Une fois connecté, cliquez sur **"Build a Database"**
2. Choisissez le plan **FREE (M0)** - C'est gratuit et suffisant pour commencer
3. Choisissez un **Cloud Provider** (AWS, Google Cloud, ou Azure)
4. Choisissez une **Région** proche de vous (ex: `eu-west-1` pour l'Europe)
5. Laissez les autres options par défaut
6. Cliquez sur **"Create"**

⏱️ **Note** : La création du cluster peut prendre 3-5 minutes

## 📋 Étape 3 : Créer un utilisateur de base de données

1. Dans la section **"Security"** > **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Créez un nom d'utilisateur (ex: `dawini-user`)
5. Créez un mot de passe **fort** (⚠️ **SAVEZ-LE BIEN, vous en aurez besoin !**)
6. Dans **"Database User Privileges"**, choisissez **"Read and write to any database"**
7. Cliquez sur **"Add User"**

## 📋 Étape 4 : Configurer l'accès réseau

1. Dans la section **"Security"** > **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Pour permettre l'accès depuis Render, vous avez deux options :

   **Option A : Autoriser toutes les IP (pour le développement)**
   - Cliquez sur **"Allow Access from Anywhere"**
   - Cela ajoutera `0.0.0.0/0` à la liste blanche
   - ⚠️ **Moins sécurisé mais pratique pour commencer**

   **Option B : Autoriser uniquement Render (recommandé pour la production)**
   - Cliquez sur **"Add Current IP Address"** pour votre IP locale
   - Ajoutez aussi les plages d'IP de Render (consultez la documentation Render)
   - Plus sécurisé mais nécessite plus de configuration

4. Cliquez sur **"Confirm"**

## 📋 Étape 5 : Obtenir la chaîne de connexion

1. Dans le dashboard Atlas, cliquez sur **"Connect"** sur votre cluster
2. Choisissez **"Connect your application"**
3. Sélectionnez **"Node.js"** comme driver
4. Choisissez la version **"4.1 or later"** (ou la plus récente)
5. **Copiez la chaîne de connexion** qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 📋 Étape 6 : Compléter la chaîne de connexion

Remplacez dans la chaîne copiée :
- `<username>` par votre nom d'utilisateur (ex: `dawini-user`)
- `<password>` par votre mot de passe
- Remplacez `cluster0.xxxxx.mongodb.net` par l'URL de votre cluster (visible dans Atlas)
- Ajoutez le nom de la base de données `/dawini` avant le `?`

**Exemple final** :
```
mongodb+srv://dawini-user:VotreMotDePasse123@cluster0.xxxxx.mongodb.net/dawini?retryWrites=true&w=majority
```

**⚠️ Important** : Remplacez `cluster0.xxxxx.mongodb.net` par l'URL réelle de votre cluster MongoDB Atlas (visible dans l'interface Atlas quand vous cliquez sur "Connect").

## 📋 Étape 7 : Configurer dans Render

### Option A : Via le Dashboard Render

1. Allez dans votre service backend sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Trouvez la variable **`MONGODB_URI`**
4. Collez votre chaîne de connexion complète
5. Cliquez sur **"Save Changes"**
6. Le service redéploiera automatiquement

### Option B : Via render.yaml

Si vous utilisez un Blueprint, la variable `MONGODB_URI` est déjà définie dans `render.yaml` mais marquée comme `sync: false`. Vous devez quand même la configurer dans le dashboard Render.

## ✅ Vérification

1. Après avoir configuré `MONGODB_URI` dans Render
2. Vérifiez les logs de votre service backend
3. Vous devriez voir : `✅ Connected to MongoDB`
4. Si vous voyez une erreur, vérifiez :
   - Que le mot de passe dans l'URI est correct (pas d'espaces, caractères spéciaux encodés)
   - Que l'accès réseau autorise bien les connexions depuis Render
   - Que l'utilisateur a les bonnes permissions

## 🔒 Sécurité

### Bonnes pratiques :

1. **Ne commitez jamais** votre URI MongoDB dans Git
2. **Utilisez des mots de passe forts** pour l'utilisateur de la base de données
3. **Limitez l'accès réseau** en production (pas `0.0.0.0/0`)
4. **Activez l'authentification** à deux facteurs sur votre compte Atlas
5. **Surveillez les connexions** dans le dashboard Atlas

## 📊 Gestion de la base de données

### Accéder à vos données

1. Dans MongoDB Atlas, cliquez sur **"Browse Collections"**
2. Vous pouvez voir et modifier vos données directement dans l'interface

### Sauvegardes

- MongoDB Atlas fait des **sauvegardes automatiques** sur le plan M0 (toutes les 6 heures)
- Pour des sauvegardes plus fréquentes, vous devrez passer à un plan payant

### Monitoring

- Le dashboard Atlas fournit des métriques sur :
  - L'utilisation de la base de données
  - Les performances
  - Les connexions actives

## 🆘 Dépannage

### Erreur : "Authentication failed"

- Vérifiez que le nom d'utilisateur et le mot de passe sont corrects
- Assurez-vous que les caractères spéciaux dans le mot de passe sont encodés dans l'URI (ex: `@` devient `%40`)

### Erreur : "IP not whitelisted"

- Vérifiez que `0.0.0.0/0` est dans votre liste blanche d'accès réseau
- Ou ajoutez l'IP spécifique de Render

### Erreur : "Connection timeout"

- Vérifiez que votre cluster est bien démarré (pas en pause)
- Vérifiez que l'accès réseau est bien configuré

### Erreur : "Database not found"

- C'est normal ! MongoDB créera automatiquement la base de données `dawini` au premier accès
- Vous n'avez pas besoin de créer la base de données manuellement

## 📝 Résumé des étapes

1. ✅ Créer un compte MongoDB Atlas
2. ✅ Créer un cluster M0 (gratuit)
3. ✅ Créer un utilisateur de base de données
4. ✅ Configurer l'accès réseau (`0.0.0.0/0` pour commencer)
5. ✅ Obtenir la chaîne de connexion
6. ✅ Configurer `MONGODB_URI` dans Render
7. ✅ Vérifier la connexion dans les logs

## 💡 Astuce

Pour tester la connexion localement avant de déployer :

1. Créez un fichier `.env` dans `Dawini-backend/`
2. Ajoutez votre URI MongoDB Atlas :
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dawini?retryWrites=true&w=majority
   ```
3. Démarrez votre backend localement
4. Vérifiez que vous voyez `✅ Connected to MongoDB`

---

**Besoin d'aide ?** Consultez la [documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)

