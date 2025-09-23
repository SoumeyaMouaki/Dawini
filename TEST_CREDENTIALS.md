# 🔐 Identifiants de Test - Dawini

## 📋 **Résumé des Comptes de Test**

Tous les comptes utilisent le mot de passe : **`password123`**

---

## 👤 **PATIENTS** (3 comptes)

### **1. Ahmed Benali**
- **Email** : `ahmed.patient@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0550123456
- **NSS** : 1234567890123456
- **Groupe sanguin** : A+
- **Allergies** : Pénicilline, Pollen
- **Maladies chroniques** : Diabète type 2, Hypertension
- **Localisation** : Alger, Hydra

### **2. Fatima Zohra**
- **Email** : `fatima.patient@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0551234567
- **NSS** : 1234567890123457
- **Groupe sanguin** : O+
- **Allergies** : Aspirine
- **Maladies chroniques** : Asthme
- **Localisation** : Alger, Sidi Moussa

### **3. Karim Ouali**
- **Email** : `karim.patient@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0552345678
- **NSS** : 1234567890123458
- **Groupe sanguin** : B+
- **Allergies** : Aucune
- **Maladies chroniques** : Cholestérol élevé
- **Localisation** : Oran, Sidi Maârouf

---

## 👨‍⚕️ **MÉDECINS** (4 comptes)

### **1. Dr. Mohamed Cherif - Cardiologue**
- **Email** : `dr.cherif@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0553456789
- **Spécialisation** : Cardiologie
- **N° Ordre** : D12345
- **Tarif consultation** : 3000 DA
- **Services** : Service de nuit, Consultation vidéo
- **Localisation** : Alger, Hydra

### **2. Dr. Aicha Boudjedra - Dermatologue**
- **Email** : `dr.boudjedra@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0554567890
- **Spécialisation** : Dermatologie
- **N° Ordre** : D67890
- **Tarif consultation** : 2500 DA
- **Services** : Visite à domicile, Consultation vidéo
- **Localisation** : Alger, Sidi Moussa

### **3. Dr. Youssef Khelil - Pédiatre**
- **Email** : `dr.khelil@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0555678901
- **Spécialisation** : Pédiatrie
- **N° Ordre** : D11223
- **Tarif consultation** : 2000 DA
- **Services** : Service de nuit, Visite à domicile, Consultation vidéo
- **Localisation** : Oran, Sidi Maârouf

### **4. Dr. Leila Mansouri - Gynécologue**
- **Email** : `dr.mansouri@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0556789012
- **Spécialisation** : Gynécologie
- **N° Ordre** : D33445
- **Tarif consultation** : 3500 DA
- **Services** : Aucun service spécial
- **Localisation** : Alger, Hydra

---

## 💊 **PHARMACIENS** (2 comptes)

### **1. Pharmacien Ahmed**
- **Email** : `pharmacien.ahmed@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0557890123
- **Pharmacie** : Pharmacie de la Santé
- **N° Licence** : P12345
- **Services** : Service de nuit, Livraison à domicile, Validation d'ordonnances
- **Localisation** : Alger, Hydra

### **2. Pharmacien Fatima**
- **Email** : `pharmacien.fatima@test.com`
- **Mot de passe** : `password123`
- **Téléphone** : 0558901234
- **Pharmacie** : Pharmacie Moderne
- **N° Licence** : P67890
- **Services** : Livraison à domicile, Validation d'ordonnances
- **Localisation** : Oran, Sidi Maârouf

---

## 🧪 **Instructions de Test**

### **1. Test de Connexion**
1. Aller sur : http://localhost:5174/login
2. Utiliser n'importe quel email/mot de passe ci-dessus
3. Vérifier la redirection vers le bon tableau de bord

### **2. Test de Recherche de Médecins**
1. Se connecter en tant que patient
2. Aller sur : http://localhost:5174/search
3. Rechercher par spécialisation (ex: "Cardiologie", "Dermatologie")
4. Tester les filtres par localisation

### **3. Test de Réservation de Rendez-vous**
1. Se connecter en tant que patient
2. Rechercher un médecin
3. Cliquer sur "Prendre RDV" ou "Test"
4. Remplir le formulaire de réservation
5. Vérifier la confirmation

### **4. Test de Recherche de Patients (Médecins)**
1. Se connecter en tant que médecin
2. Aller sur le tableau de bord médecin
3. Cliquer sur "Rechercher patient"
4. Tester la recherche par nom, email, ou NSS

### **5. Test du Système de Messagerie**
1. Se connecter en tant que patient
2. Aller sur : http://localhost:5174/messages
3. Tester l'envoi de messages
4. Se connecter en tant que médecin/pharmacien
5. Vérifier la réception des messages

### **6. Test des Tableaux de Bord**
- **Patient** : http://localhost:5174/patient/dashboard
- **Médecin** : http://localhost:5174/doctor/dashboard
- **Pharmacien** : http://localhost:5174/pharmacy/dashboard

---

## 🔧 **Dépannage**

### **Problème de Connexion**
- Vérifier que le backend est en cours d'exécution (port 5000)
- Vérifier que le frontend est en cours d'exécution (port 5174)
- Vérifier la connexion à MongoDB

### **Problème de Rendez-vous**
- Utiliser le bouton "Test" pour déboguer
- Vérifier la console du navigateur
- Vérifier les logs du backend

### **Problème de Recherche**
- Vérifier que les données sont bien créées
- Tester avec différents critères de recherche
- Vérifier les filtres de localisation

---

## 📊 **Données de Test Créées**

- **Utilisateurs** : 9 comptes
- **Profils** : 9 profils complets
- **Patients** : 3 avec données médicales
- **Médecins** : 4 avec spécialisations différentes
- **Pharmaciens** : 2 avec services variés
- **Localisations** : Alger et Oran avec coordonnées GPS

**Tous les comptes sont prêts à être utilisés pour tester l'application !** 🚀
