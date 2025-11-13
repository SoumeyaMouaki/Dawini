// Script to restore the original users before the bug
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Pharmacy from './models/Pharmacy.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dawini';

async function restoreOriginalUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // PATIENTS
    const patients = [
      {
        fullName: 'Ahmed Benali',
        email: 'ahmed.patient@test.com',
        phone: '+213123456001',
        address: { wilaya: 'Alger', commune: 'Hydra', coordinates: { lat: 36.7538, lng: 3.0588 } }
      },
      {
        fullName: 'Fatima Zohra',
        email: 'fatima.patient@test.com',
        phone: '+213123456002',
        address: { wilaya: 'Alger', commune: 'Sidi Moussa', coordinates: { lat: 36.7544, lng: 3.0589 } }
      },
      {
        fullName: 'Karim Ouali',
        email: 'karim.patient@test.com',
        phone: '+213123456003',
        address: { wilaya: 'Oran', commune: 'Centre', coordinates: { lat: 35.6969, lng: -0.6331 } }
      }
    ];

    for (const patientData of patients) {
      // Create patient user
      const patientUser = new User({
        fullName: patientData.fullName,
        email: patientData.email,
        password: hashedPassword,
        userType: 'patient',
        phone: patientData.phone,
        address: patientData.address
      });
      await patientUser.save();

      // Create patient profile
      const patientProfile = new Patient({
        userId: patientUser._id,
        nss: `NSS${Math.floor(Math.random() * 1000000000000000)}`,
        dateOfBirth: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
        allergies: ['Pénicilline', 'Pollen', 'Acariens'].slice(0, Math.floor(Math.random() * 3)),
        chronicDiseases: ['Diabète', 'Hypertension', 'Asthme'].slice(0, Math.floor(Math.random() * 2)),
        emergencyContact: {
          name: 'Contact d\'urgence',
          phone: '+213987654321',
          relationship: 'Famille'
        }
      });
      await patientProfile.save();
      console.log(`✅ Created patient: ${patientData.fullName}`);
    }

    // MÉDECINS
    const doctors = [
      {
        fullName: 'Dr. Mohamed Cherif',
        email: 'dr.cherif@test.com',
        specialization: 'Cardiologie',
        phone: '+213123456101',
        address: { wilaya: 'Alger', commune: 'Hydra', coordinates: { lat: 36.7538, lng: 3.0588 } }
      },
      {
        fullName: 'Dr. Aicha Boudjedra',
        email: 'dr.boudjedra@test.com',
        specialization: 'Dermatologie',
        phone: '+213123456102',
        address: { wilaya: 'Alger', commune: 'Sidi Moussa', coordinates: { lat: 36.7544, lng: 3.0589 } }
      },
      {
        fullName: 'Dr. Youssef Khelil',
        email: 'dr.khelil@test.com',
        specialization: 'Pédiatrie',
        phone: '+213123456103',
        address: { wilaya: 'Oran', commune: 'Centre', coordinates: { lat: 35.6969, lng: -0.6331 } }
      },
      {
        fullName: 'Dr. Leila Mansouri',
        email: 'dr.mansouri@test.com',
        specialization: 'Gynécologie',
        phone: '+213123456104',
        address: { wilaya: 'Constantine', commune: 'Centre', coordinates: { lat: 36.3650, lng: 6.6147 } }
      }
    ];

    for (let i = 0; i < doctors.length; i++) {
      const doctorData = doctors[i];
      
      // Create doctor user
      const doctorUser = new User({
        fullName: doctorData.fullName,
        email: doctorData.email,
        password: hashedPassword,
        userType: 'doctor',
        phone: doctorData.phone,
        address: doctorData.address
      });
      await doctorUser.save();

      // Create doctor profile
      const doctorProfile = new Doctor({
        userId: doctorUser._id,
        nOrdre: `ORD${1000 + i}`,
        specialization: doctorData.specialization,
        licenseNumber: `LIC${1000 + i}`,
        yearsOfExperience: 5 + i,
        consultationFee: 2000 + (i * 500),
        isVerified: true,
        isAvailable: true,
        workingHours: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: { start: '09:00', end: '13:00' }
        },
        languages: ['fr', 'ar', 'en']
      });
      await doctorProfile.save();
      console.log(`✅ Created doctor: ${doctorData.fullName} (${doctorData.specialization})`);
    }

    // PHARMACIENS
    const pharmacists = [
      {
        fullName: 'Pharmacien Ahmed',
        email: 'pharmacien.ahmed@test.com',
        pharmacyName: 'Pharmacie Ahmed',
        phone: '+213123456201',
        address: { wilaya: 'Alger', commune: 'Hydra', coordinates: { lat: 36.7538, lng: 3.0588 } }
      },
      {
        fullName: 'Pharmacien Fatima',
        email: 'pharmacien.fatima@test.com',
        pharmacyName: 'Pharmacie Fatima',
        phone: '+213123456202',
        address: { wilaya: 'Alger', commune: 'Sidi Moussa', coordinates: { lat: 36.7544, lng: 3.0589 } }
      }
    ];

    for (let i = 0; i < pharmacists.length; i++) {
      const pharmacistData = pharmacists[i];
      
      // Create pharmacist user
      const pharmacistUser = new User({
        fullName: pharmacistData.fullName,
        email: pharmacistData.email,
        password: hashedPassword,
        userType: 'pharmacist',
        phone: pharmacistData.phone,
        address: pharmacistData.address
      });
      await pharmacistUser.save();

      // Create pharmacy profile
      const pharmacyProfile = new Pharmacy({
        userId: pharmacistUser._id,
        pharmacyName: pharmacistData.pharmacyName,
        licenseNumber: `PHARM${1000 + i}`,
        location: {
          wilaya: pharmacistData.address.wilaya,
          commune: pharmacistData.address.commune,
          street: 'Rue de la Pharmacie',
          postalCode: '16000',
          coordinates: {
            latitude: pharmacistData.address.coordinates.lat,
            longitude: pharmacistData.address.coordinates.lng
          }
        },
        workingHours: {
          monday: { start: '08:00', end: '20:00' },
          tuesday: { start: '08:00', end: '20:00' },
          wednesday: { start: '08:00', end: '20:00' },
          thursday: { start: '08:00', end: '20:00' },
          friday: { start: '08:00', end: '20:00' },
          saturday: { start: '09:00', end: '18:00' },
          sunday: { start: '09:00', end: '18:00' }
        },
        services: ['Médicaments', 'Consultation', 'Livraison']
      });
      await pharmacyProfile.save();
      console.log(`✅ Created pharmacist: ${pharmacistData.fullName}`);
    }

    console.log('\n🎉 Original users restored successfully!');
    console.log('\n🔐 Identifiants Principaux');
    console.log('   PATIENTS');
    console.log('Ahmed Benali : ahmed.patient@test.com / password123');
    console.log('Fatima Zohra : fatima.patient@test.com / password123');
    console.log('Karim Ouali : karim.patient@test.com / password123');
    console.log('  ‍⚕️ MÉDECINS');
    console.log('Dr. Mohamed Cherif (Cardiologie) : dr.cherif@test.com / password123');
    console.log('Dr. Aicha Boudjedra (Dermatologie) : dr.boudjedra@test.com / password123');
    console.log('Dr. Youssef Khelil (Pédiatrie) : dr.khelil@test.com / password123');
    console.log('Dr. Leila Mansouri (Gynécologie) : dr.mansouri@test.com / password123');
    console.log('💊 PHARMACIENS');
    console.log('Pharmacien Ahmed : pharmacien.ahmed@test.com / password123');
    console.log('Pharmacien Fatima : pharmacien.fatima@test.com / password123');

  } catch (error) {
    console.error('❌ Error restoring original users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

restoreOriginalUsers();
