// Script to check if users exist in database
import mongoose from 'mongoose';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Pharmacy from './models/Pharmacy.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dawini';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check users
    const users = await User.find({});
    console.log(`\n👥 Total users in database: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.email}) - Type: ${user.userType}`);
    });

    // Check doctors
    const doctors = await Doctor.find({});
    console.log(`\n👨‍⚕️ Total doctors in database: ${doctors.length}`);
    
    doctors.forEach(doctor => {
      console.log(`- ${doctor.specialization} - Verified: ${doctor.isVerified}`);
    });

    // Check patients
    const patients = await Patient.find({});
    console.log(`\n👤 Total patients in database: ${patients.length}`);

    // Check pharmacies
    const pharmacies = await Pharmacy.find({});
    console.log(`\n💊 Total pharmacies in database: ${pharmacies.length}`);

    // Test specific user
    const testUser = await User.findOne({ email: 'dr.cherif@test.com' });
    if (testUser) {
      console.log(`\n🔍 Test user found: ${testUser.fullName}`);
      console.log(`- Email: ${testUser.email}`);
      console.log(`- UserType: ${testUser.userType}`);
      console.log(`- Password hash: ${testUser.password.substring(0, 20)}...`);
    } else {
      console.log('\n❌ Test user dr.cherif@test.com NOT FOUND');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

checkUsers();
