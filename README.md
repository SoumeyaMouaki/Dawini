# 🚀 Dawini Backend API

Backend Node.js/Express pour la plateforme de santé numérique Dawini.

## 📋 Fonctionnalités

- **Authentification JWT** pour patients, médecins et pharmaciens
- **Gestion des rendez-vous** avec validation des disponibilités
- **Système de prescriptions** électroniques sécurisées
- **API RESTful** complète avec validation et documentation
- **Sécurité renforcée** avec rate limiting et validation des données
- **Base de données MongoDB** avec modèles optimisés

## 🛠️ Technologies

- **Node.js** 18+
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification stateless
- **bcryptjs** - Hachage des mots de passe
- **Express Validator** - Validation des données
- **Helmet** - Sécurité des en-têtes HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📁 Structure du projet

```
dawini-backend/
├── models/              # Modèles MongoDB
│   ├── User.js         # Modèle utilisateur de base
│   ├── Patient.js      # Modèle patient
│   ├── Doctor.js       # Modèle médecin
│   ├── Pharmacy.js     # Modèle pharmacie
│   ├── Appointment.js  # Modèle rendez-vous
│   └── Prescription.js # Modèle prescription
├── routes/              # Routes API
│   ├── auth.js         # Authentification
│   ├── patients.js     # API patients
│   ├── doctors.js      # API médecins
│   ├── pharmacies.js   # API pharmacies
│   ├── appointments.js # API rendez-vous
│   └── prescriptions.js # API prescriptions
├── middleware/          # Middlewares Express
│   └── auth.js         # Authentification et autorisation
├── server.js           # Point d'entrée principal
├── package.json        # Dépendances et scripts
└── env.example         # Variables d'environnement
```

## 🚀 Installation

### 1. Dépendances
```bash
npm install
```

### 2. Configuration
```bash
cp env.example .env
```

Modifiez le fichier `.env` :
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dawini
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

### 3. Base de données
Assurez-vous que MongoDB est en cours d'exécution :
```bash
mongod
```

### 4. Démarrage
```bash
# Développement
npm run dev

# Production
npm start
```

## 🔐 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription utilisateur |
| POST | `/api/auth/login` | Connexion utilisateur |
| POST | `/api/auth/refresh` | Rafraîchissement token |
| POST | `/api/auth/logout` | Déconnexion |

### Patients
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/patients/:id/appointments` | Rendez-vous du patient |
| GET | `/api/patients/:id/prescriptions` | Prescriptions du patient |
| GET | `/api/patients/:id/profile` | Profil patient |
| PUT | `/api/patients/:id/profile` | Mise à jour profil |

### Rendez-vous
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/appointments` | Créer un rendez-vous |
| GET | `/api/appointments` | Lister les rendez-vous |
| GET | `/api/appointments/:id` | Détails d'un rendez-vous |
| PUT | `/api/appointments/:id` | Modifier un rendez-vous |
| DELETE | `/api/appointments/:id` | Annuler un rendez-vous |
| GET | `/api/appointments/doctor/:id/availability` | Vérifier disponibilité |

### Prescriptions
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/prescriptions` | Créer une prescription |
| GET | `/api/prescriptions` | Lister les prescriptions |
| GET | `/api/prescriptions/:id` | Détails d'une prescription |
| PUT | `/api/prescriptions/:id/confirm` | Confirmer une prescription |
| POST | `/api/prescriptions/:id/report` | Signaler un problème |

## 🗄️ Modèles de données

### User
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashé),
  phone: String,
  userType: ['patient', 'doctor', 'pharmacist'],
  address: {
    wilaya: String,
    commune: String,
    street: String,
    postalCode: String
  },
  isVerified: Boolean,
  isActive: Boolean
}
```

### Patient
```javascript
{
  userId: ObjectId (ref: User),
  dateOfBirth: Date,
  gender: ['male', 'female', 'other'],
  nss: String (unique),
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  bloodType: String,
  allergies: [String],
  chronicConditions: [String]
}
```

### Doctor
```javascript
{
  userId: ObjectId (ref: User),
  nOrdre: String (unique),
  specialization: String,
  services: {
    nightService: Boolean,
    homeVisit: Boolean,
    videoConsultation: Boolean
  },
  workingHours: {
    monday: { start: String, end: String, isWorking: Boolean },
    // ... autres jours
  },
  consultationDuration: Number,
  consultationFee: Number
}
```

### Appointment
```javascript
{
  patientId: ObjectId (ref: Patient),
  doctorId: ObjectId (ref: Doctor),
  date: Date,
  time: String,
  duration: Number,
  type: ['consultation', 'follow-up', 'emergency'],
  status: ['pending', 'confirmed', 'completed', 'cancelled'],
  reason: String,
  notes: {
    patient: String,
    doctor: String
  }
}
```

## 🔒 Sécurité

### Middleware d'authentification
- Vérification JWT sur toutes les routes protégées
- Validation des types d'utilisateurs
- Vérification des permissions

### Validation des données
- Validation côté serveur avec Express Validator
- Sanitisation des entrées utilisateur
- Validation des schémas MongoDB

### Protection contre les attaques
- Rate limiting (100 requêtes/15min par IP)
- Headers de sécurité avec Helmet
- CORS configuré pour le frontend

## 📊 Tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-domain.com
```

### PM2 (recommandé)
```bash
npm install -g pm2
pm2 start server.js --name "dawini-backend"
pm2 save
pm2 startup
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Logs

Les logs sont configurés pour :
- Erreurs d'API
- Tentatives d'authentification
- Opérations de base de données
- Performance des requêtes

## 🔧 Maintenance

### Sauvegarde de la base de données
```bash
# Sauvegarde complète
mongodump --db dawini --out ./backups

# Restauration
mongorestore --db dawini ./backups/dawini
```

### Monitoring
- Endpoint de santé : `/api/health`
- Métriques de performance
- Alertes en cas d'erreur

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Ouvrez une Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dawini/issues)
- **Documentation**: [docs.dawini.dz](https://docs.dawini.dz)
- **Email**: dev@dawini.dz

---

**Dawini Backend** - API robuste et sécurisée pour la santé numérique 🇩🇿
