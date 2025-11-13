// Quick script to add test data for search suggestions
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dawini';

async function addTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users and doctors
    const specialties = [
      'Cardiologie',
      'Dermatologie', 
      'Ophtalmologie',
      'Neurologie',
      'Pédiatrie',
      'Gynécologie',
      'Orthopédie',
      'Psychiatrie'
    ];

    const locations = [
      { wilaya: 'Alger', commune: 'Hydra', lat: 36.7538, lng: 3.0588 },
      { wilaya: 'Alger', commune: 'Sidi Moussa', lat: 36.7544, lng: 3.0589 },
      { wilaya: 'Alger', commune: 'El Biar', lat: 36.7550, lng: 3.0590 },
      { wilaya: 'Oran', commune: 'Centre', lat: 35.6969, lng: -0.6331 },
      { wilaya: 'Constantine', commune: 'Centre', lat: 36.3650, lng: 6.6147 }
    ];

    for (let i = 0; i < specialties.length; i++) {
      const specialty = specialties[i];
      const location = locations[i % locations.length];
      
      // Create user
      const user = new User({
        fullName: `Dr. ${specialty}`,
        email: `${specialty.toLowerCase()}@test.com`,
        password: hashedPassword,
        userType: 'doctor',
        phone: `+21312345678${i}`,
        address: {
          wilaya: location.wilaya,
          commune: location.commune,
          coordinates: { lat: location.lat, lng: location.lng }
        }
      });
      await user.save();

      // Create doctor profile
      const doctor = new Doctor({
        userId: user._id,
        nOrdre: `ORD${1000 + i}`,
        specialization: specialty,
        licenseNumber: `LIC${1000 + i}`,
        yearsOfExperience: 5 + i,
        consultationFee: 2000 + (i * 500),
        isVerified: true, // Important: set as verified
        isAvailable: true, // Important: set as available
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
      await doctor.save();

      console.log(`✅ Created doctor: ${specialty} in ${location.wilaya}, ${location.commune}`);
    }

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

    // Create patient profile
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
    console.log('✅ Created test patient with profile');

    console.log('\n🎉 Test data created successfully!');
    console.log('\nTest accounts:');
    console.log('Patient: patient@test.com / password123');
    console.log('Doctors: [specialty]@test.com / password123');
    console.log('Specialties:', specialties.join(', '));

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

addTestData();
