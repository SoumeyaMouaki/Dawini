<<<<<<< HEAD
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
=======
# 🏥 Dawini - Votre Santé Numérique en Algérie

Dawini est une plateforme de santé numérique algérienne complète qui centralise la gestion des soins de santé pour les patients, les professionnels (médecins, pharmaciens), et les cliniques.

## ✨ Fonctionnalités principales

### 👤 Espace Patients
- Création de compte patient
- Prise de rendez-vous avec filtres par spécialité, localisation, disponibilité
- Ordonnances électroniques accessibles
- Suivi des rendez-vous et historique
- Alertes & rappels par email

### 🩺 Espace Médecins
- Fiche profil avec validation (spécialité, localisation, N° ordre)
- Gestion des rendez-vous
- Création & envoi d'ordonnances électroniques
- Communication sécurisée avec patients & pharmaciens

### 💊 Espace Pharmaciens
- Accès aux ordonnances émises par les médecins partenaires
- Confirmation des prescriptions
- Possibilité de signaler une incompatibilité ou rupture

## 🚀 Technologies utilisées

### Frontend
- **React 18** avec Vite
- **Tailwind CSS** pour le design
- **React Hook Form** avec validation Zod
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **Express Validator** pour la validation
- **Helmet** pour la sécurité

## 📋 Prérequis

- Node.js 18+ 
- MongoDB 6+
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd dawini
```

### 2. Installer les dépendances Frontend
```bash
cd Dawini
npm install
```

### 3. Installer les dépendances Backend
```bash
cd ../Dawini-backend
npm install
```

### 4. Configuration de l'environnement

#### Backend
```bash
cd Dawini-backend
cp env.example .env
```

Modifiez le fichier `.env` avec vos configurations :
>>>>>>> f20ac52587bac564ee0b1d2e31eabf0bfffba55e
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dawini
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

<<<<<<< HEAD
### 3. Base de données
Assurez-vous que MongoDB est en cours d'exécution :
=======
#### Frontend
```bash
cd Dawini
```

Créez un fichier `.env.local` :
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Démarrer MongoDB
>>>>>>> f20ac52587bac564ee0b1d2e31eabf0bfffba55e
```bash
mongod
```

<<<<<<< HEAD
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
=======
### 6. Démarrer le Backend
```bash
cd Dawini-backend
npm run dev
```

### 7. Démarrer le Frontend
```bash
cd Dawini
npm run dev
```

## 🌐 URLs d'accès

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📱 Structure de l'application

### Pages principales
- **Accueil** (`/`) - Page d'accueil avec recherche de médecins
- **Inscription** (`/register`) - Création de compte pour tous les types d'utilisateurs
- **Connexion** (`/login`) - Authentification des utilisateurs

### Espaces utilisateurs
- **Patient** (`/patient/dashboard`) - Tableau de bord patient
- **Médecin** (`/doctor/dashboard`) - Tableau de bord médecin
- **Pharmacien** (`/pharmacy/dashboard`) - Tableau de bord pharmacien

## 🔐 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/refresh` - Rafraîchissement du token
- `POST /api/auth/logout` - Déconnexion

### Patients
- `GET /api/patients/:id/appointments` - Rendez-vous du patient
- `GET /api/patients/:id/prescriptions` - Prescriptions du patient
- `GET /api/patients/:id/profile` - Profil patient
- `PUT /api/patients/:id/profile` - Mise à jour profil

### Rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments` - Lister les rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Annuler un rendez-vous
- `GET /api/appointments/doctor/:id/availability` - Vérifier disponibilité

### Prescriptions
- `POST /api/prescriptions` - Créer une prescription
- `GET /api/prescriptions` - Lister les prescriptions
- `PUT /api/prescriptions/:id/confirm` - Confirmer une prescription
- `POST /api/prescriptions/:id/report` - Signaler un problème

## 🗄️ Modèles de données

### User (Utilisateur de base)
- Informations de base (nom, email, mot de passe, téléphone)
- Type d'utilisateur (patient, médecin, pharmacien)
- Adresse (wilaya, commune, rue, code postal)
- Statut de vérification et activation

### Patient
- Informations médicales (date de naissance, genre, NSS)
- Contact d'urgence
- Informations médicales (groupe sanguin, allergies, conditions chroniques)
- Préférences linguistiques

### Doctor
- Informations professionnelles (N° ordre, spécialisation)
- Services offerts (consultation nocturne, à domicile, visio)
- Horaires de travail
- Biographie et certifications

### Pharmacy
- Informations de la pharmacie (nom, numéro de licence)
- Horaires d'ouverture
- Services (livraison, service de nuit)
- Niveau de partenariat

### Appointment (Rendez-vous)
- Patient et médecin
- Date, heure et durée
- Type de consultation
- Statut et notes
- Système de rappels

### Prescription
- Patient et médecin
- Code de prescription unique
- Médicaments et posologie
- Instructions et validité
- Signature numérique

## 🎨 Design et UX

- **Interface responsive** mobile-first
- **Design minimaliste** avec couleurs apaisantes
- **Support multilingue** (Français/Anglais)
- **Navigation intuitive** avec breadcrumbs
- **Feedback visuel** pour toutes les actions
- **Accessibilité** respectée

## 🔒 Sécurité

- **JWT** pour l'authentification
- **Hachage bcrypt** des mots de passe
- **Validation** côté serveur et client
- **Rate limiting** pour prévenir les abus
- **CORS** configuré
- **Helmet** pour les en-têtes de sécurité

## 📊 Business Model

- **Gratuit** pour les patients
- **Abonnement mensuel** pour médecins (1500 DA/mois)
- **Pack clinique** à partir de 6000 DA/mois
- **Commissions** sur rendez-vous premium
- **Partenariats** pharmacies avec badges de confiance

## 🚧 Développement

### Scripts disponibles

#### Backend
```bash
npm run dev      # Démarrage en mode développement
npm start        # Démarrage en production
npm test         # Exécution des tests
```

#### Frontend
```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm run preview  # Prévisualisation du build
```

### Structure des dossiers
```
dawini/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── context/       # Contextes React
│   ├── api/           # Configuration API
│   ├── routes/        # Composants de routage
│   └── locales/       # Fichiers de traduction
├── public/            # Assets statiques
└── tailwind.config.js # Configuration Tailwind

dawini-backend/
├── models/            # Modèles MongoDB
├── routes/            # Routes API
├── middleware/        # Middlewares Express
└── server.js         # Point d'entrée
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- **Email**: support@dawini.dz
- **Documentation**: [docs.dawini.dz](https://docs.dawini.dz)
- **Issues**: [GitHub Issues](https://github.com/dawini/issues)

## 🔮 Roadmap

### Phase 1 (Actuelle)
- ✅ Authentification et gestion des utilisateurs
- ✅ Gestion des rendez-vous
- ✅ Système de prescriptions
- ✅ Tableaux de bord de base

### Phase 2
- 🔄 Système de messagerie sécurisée
- 🔄 Notifications par email/SMS
- 🔄 Intégration Google Maps
- 🔄 Système de paiement

### Phase 3
- 📋 Application mobile React Native
- 📋 IA pour la recommandation de médecins
- 📋 Intégration avec les systèmes hospitaliers
- 📋 Analytics et rapports avancés

---

**Dawini** - Révolutionner la santé numérique en Algérie 🇩🇿
>>>>>>> f20ac52587bac564ee0b1d2e31eabf0bfffba55e
