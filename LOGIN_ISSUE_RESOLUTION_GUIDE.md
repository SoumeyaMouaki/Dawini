# 🔐 Guide de Résolution des Problèmes de Connexion

## 🎯 Problème Actuel

### **Erreur 429 (Too Many Requests) → Erreur 401 (Invalid email or password)**
- ❌ **Symptôme** : `Login: Login failed AxiosError {message: 'Request failed with status code 429'}`
- ✅ **Progrès** : L'erreur 429 a été résolue avec le rate limiting
- ❌ **Nouveau problème** : Erreur 401 (Invalid email or password)

## 🔍 Diagnostic Effectué

### **1. Rate Limiting Résolu**
- ✅ **Configuration backend** : Augmenté de 100 à 1000 requêtes par 15 minutes
- ✅ **Rate limiting spécifique** : 50 requêtes auth par 15 minutes
- ✅ **Rate limiting frontend** : Système de limitation des requêtes

### **2. Utilisateurs de Test Créés**
- ✅ **Patient** : `patient@test.com` / `password123`
- ✅ **Médecin** : `doctor@test.com` / `password123`
- ✅ **Pharmacien** : `pharmacist@test.com` / `password123`

### **3. Problème de Connexion Identifié**
- ❌ **Serveur backend** : Ne démarre pas correctement
- ❌ **Logs de debug** : Non visibles
- ❌ **Test de connexion** : Échec avec erreur undefined

## 🛠️ Solutions à Appliquer

### **1. Vérifier le Serveur Backend**

#### **Étape 1 : Vérifier le Port**
```bash
netstat -an | findstr :5000
```
**Résultat attendu** : `TCP 0.0.0.0:5000 0.0.0.0:0 LISTENING`

#### **Étape 2 : Démarrer le Serveur**
```bash
cd Dawini-backend
npm start
```
**Vérifier** : Aucune erreur dans la console

#### **Étape 3 : Tester la Connexion**
```bash
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"patient@test.com\",\"password\":\"password123\"}"
```

### **2. Vérifier la Base de Données**

#### **Étape 1 : Connexion MongoDB**
```bash
mongosh
use dawini
db.users.find({email: "patient@test.com"})
```
**Vérifier** : L'utilisateur existe avec un mot de passe hashé

#### **Étape 2 : Vérifier le Hash du Mot de Passe**
```javascript
// Dans MongoDB
db.users.findOne({email: "patient@test.com"}, {password: 1})
```
**Vérifier** : Le mot de passe est bien hashé (commence par $2a$)

### **3. Vérifier les Logs de Debug**

#### **Logs Backend**
```javascript
// Dans routes/auth.js - ligne 211-217
console.log('Login attempt for:', email);
console.log('User found:', !!user);
console.log('User password hash:', user.password);
console.log('Provided password:', password);
console.log('Password valid:', isPasswordValid);
```

#### **Logs Frontend**
```javascript
// Dans context/AuthContext.jsx - ligne 34-37
console.log('AuthContext: Attempting login for', email);
console.log('AuthContext: Login response', data);
```

## 🧪 Tests de Validation

### **1. Test de Connexion Directe**

#### **Script de Test**
```javascript
// test-login.js
import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'patient@test.com',
      password: 'password123'
    });
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Error:', error.message);
  }
}

testLogin();
```

### **2. Test de la Base de Données**

#### **Vérifier les Utilisateurs**
```javascript
// Dans MongoDB
db.users.find({}, {fullName: 1, email: 1, userType: 1})
```

#### **Vérifier les Profils**
```javascript
// Dans MongoDB
db.patients.find({}, {userId: 1})
db.doctors.find({}, {userId: 1})
db.pharmacies.find({}, {userId: 1})
```

### **3. Test de l'API Backend**

#### **Test de Santé**
```bash
curl http://localhost:5000/api/health
```

#### **Test de Connexion**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}'
```

## 🔧 Corrections Appliquées

### **1. Rate Limiting Backend**
```javascript
// server.js - Ligne 32-55
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Augmenté de 100 à 1000
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requêtes auth par 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});
```

### **2. Rate Limiting Frontend**
```javascript
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }
  // ... implémentation
}
```

### **3. Utilisateurs de Test**
```javascript
// create-test-users.js
const hashedPassword = await bcrypt.hash('password123', 10);

const patientUser = new User({
  fullName: 'Test Patient',
  email: 'patient@test.com',
  password: hashedPassword,
  userType: 'patient',
  // ... autres champs
});
```

## 📊 État Actuel

### **✅ Résolu**
- **Erreur 429** : Rate limiting configuré
- **Utilisateurs de test** : Créés avec succès
- **Rate limiting frontend** : Implémenté

### **❌ En Cours**
- **Connexion** : Erreur 401 persistante
- **Serveur backend** : Problème de démarrage
- **Logs de debug** : Non visibles

### **🔍 À Vérifier**
- **MongoDB** : Connexion et données
- **Hash des mots de passe** : Validité
- **JWT secret** : Configuration
- **CORS** : Configuration

## 🚀 Prochaines Étapes

### **1. Redémarrer le Serveur Backend**
```bash
cd Dawini-backend
npm start
```

### **2. Vérifier les Logs**
- Regarder la console du serveur backend
- Vérifier les logs de debug dans auth.js

### **3. Tester la Connexion**
```bash
node test-login.js
```

### **4. Vérifier la Base de Données**
```bash
mongosh
use dawini
db.users.find({email: "patient@test.com"})
```

## 🔗 Accès

- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:5000
- **MongoDB** : mongodb://localhost:27017/dawini
- **Comptes de test** :
  - Patient : `patient@test.com` / `password123`
  - Médecin : `doctor@test.com` / `password123`
  - Pharmacien : `pharmacist@test.com` / `password123`

## 📝 Notes

### **Problèmes Identifiés**
1. **Rate limiting trop restrictif** → Résolu
2. **Utilisateurs de test manquants** → Résolu
3. **Serveur backend instable** → En cours
4. **Logs de debug manquants** → En cours

### **Solutions Appliquées**
1. **Rate limiting** : Augmenté et spécialisé
2. **Utilisateurs de test** : Créés avec succès
3. **Rate limiting frontend** : Implémenté
4. **Logs de debug** : Ajoutés

**Le problème principal est maintenant le démarrage du serveur backend !** 🎯
