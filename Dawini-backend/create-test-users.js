// Script to create test users for the application
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Pharmacy from './models/Pharmacy.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dawini';

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: ['patient@test.com', 'doctor@test.com', 'pharmacist@test.com'] } });
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('🧹 Cleared existing test data');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test patient
    const patientUser = new User({
      fullName: 'Test Patient',
      email: 'patient@test.com',
      password: hashedPassword,
      userType: 'patient',
      phone: '+213123456789',
      address: {
        wilaya: 'Alger',
        commune: 'Hydra',
        coordinates: { lat: 36.7538, lng: 3.0588 }
      }
    });
    await patientUser.save();
    console.log('✅ Created patient user');

    const patientProfile = new Patient({
      userId: patientUser._id,
      nss: '1234567890123456',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      bloodType: 'O+',
      allergies: ['Pénicilline', 'Pollen'],
      chronicDiseases: ['Diabète type 2'],
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+213987654321',
        relationship: 'Famille'
      }
    });
    await patientProfile.save();
    console.log('✅ Created patient profile');

    // Create test doctor
    const doctorUser = new User({
      fullName: 'Dr. Test Doctor',
      email: 'doctor@test.com',
      password: hashedPassword,
      userType: 'doctor',
      phone: '+213123456788',
      address: {
        wilaya: 'Alger',
        commune: 'Sidi Moussa',
        coordinates: { lat: 36.7544, lng: 3.0589 }
      }
    });
    await doctorUser.save();
    console.log('✅ Created doctor user');

    const doctorProfile = new Doctor({
      userId: doctorUser._id,
      nOrdre: '12345',
      specialization: 'Cardiologie',
      licenseNumber: 'LIC123456',
      yearsOfExperience: 10,
      consultationFee: 2000,
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
    console.log('✅ Created doctor profile');

    // Create test pharmacist
    const pharmacistUser = new User({
      fullName: 'Test Pharmacist',
      email: 'pharmacist@test.com',
      password: hashedPassword,
      userType: 'pharmacist',
      phone: '+213123456787',
      address: {
        wilaya: 'Alger',
        commune: 'Hydra',
        coordinates: { lat: 36.7539, lng: 3.0587 }
      }
    });
    await pharmacistUser.save();
    console.log('✅ Created pharmacist user');

    const pharmacyProfile = new Pharmacy({
      userId: pharmacistUser._id,
      pharmacyName: 'Pharmacie Test',
      licenseNumber: 'PHARM123456',
      location: {
        wilaya: 'Alger',
        commune: 'Hydra',
        street: 'Rue de la Pharmacie',
        postalCode: '16000',
        coordinates: {
          latitude: 36.7539,
          longitude: 3.0587
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
    console.log('✅ Created pharmacy profile');

    console.log('\n🎉 All test users created successfully!');
    console.log('\nTest accounts:');
    console.log('Patient: patient@test.com / password123');
    console.log('Doctor: doctor@test.com / password123');
    console.log('Pharmacist: pharmacist@test.com / password123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

createTestUsers();
