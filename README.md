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
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dawini
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

#### Frontend
```bash
cd Dawini
```

Créez un fichier `.env.local` :
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Démarrer MongoDB
```bash
mongod
```

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
