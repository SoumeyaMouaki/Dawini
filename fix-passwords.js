// Script to fix double-hashed passwords
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dawini';

async function fixPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n🔧 Fixing password for: ${user.fullName} (${user.email})`);
      
      // Set the password directly without hashing (the pre-save hook will handle it)
      user.password = 'password123';
      await user.save();
      
      console.log(`✅ Password fixed for ${user.fullName}`);
    }

    console.log('\n🎉 All passwords fixed successfully!');
    console.log('\nTest login with any user:');
    console.log('- Email: [any user email]');
    console.log('- Password: password123');

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

fixPasswords();
