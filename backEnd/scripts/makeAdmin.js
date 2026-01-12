import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const makeUserAdmin = async (email) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database');

    // Find user by email
    const user = await User.findOne({ userEmail: email });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ Success! User is now an admin:');
    console.log('   Name:', user.userName);
    console.log('   Email:', user.userEmail);
    console.log('   Role:', user.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/makeAdmin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
