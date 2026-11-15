require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('='.repeat(55));
  console.log('  UPMS DATABASE CONNECTION DIAGNOSTIC TOOL');
  console.log('='.repeat(55));

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\n❌ ERROR: MONGO_URI is not defined in server/.env');
    console.log('\n👉 Fix: Open server/.env and set MONGO_URI, for example:');
    console.log('   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/user_profile_db\n');
    process.exit(1);
  }

  // Hide password in console output for security
  const maskedUri = uri.replace(/\/\/(.*?):(.*?)@/, '//***:***@');
  console.log(`\nAttempting connection to:\n  ${maskedUri}\n`);

  try {
    const startTime = Date.now();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const pingTime = Date.now() - startTime;

    console.log('✅ SUCCESS: Database connected successfully!');
    console.log(`   Host:     ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Latency:  ${pingTime}ms`);

    // Check collections & count users
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasUsers = collections.some((c) => c.name === 'users');

    if (hasUsers) {
      const count = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`   Collection "users": Found ${count} user(s)`);
    } else {
      console.log('   Collection "users": Not created yet (will be created automatically on first insert or seed)');
    }

    console.log('\n🚀 Your database is READY!');
    console.log('   You can now run:');
    console.log('     1. npm run seed  (to insert default admin and test users)');
    console.log('     2. npm run dev   (to start the server)\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED: Unable to connect to MongoDB\n');
    console.error(`Technical Error: ${err.message}\n`);

    console.log('🔍 TROUBLESHOOTING GUIDE:');

    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      console.log('  👉 Local MongoDB is not running on your machine:');
      console.log('     1. Check if MongoDB service is started:');
      console.log('        Run PowerShell as Admin: net start MongoDB');
      console.log('     2. If MongoDB is NOT installed locally, use free MongoDB Atlas (Cloud):');
      console.log('        - Sign up at https://www.mongodb.com/cloud/atlas/register');
      console.log('        - Create a free M0 cluster');
      console.log('        - Copy your connection string into server/.env');
    } else if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
      console.log('  👉 MongoDB Atlas Cloud Connection Issue:');
      console.log('     1. IP Access Whitelist:');
      console.log('        In MongoDB Atlas -> Network Access -> Add IP Address -> Choose "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('     2. Username/Password:');
      console.log('        In MongoDB Atlas -> Database Access -> ensure your database user exists.');
      console.log('        If your password has special characters like @, #, $, encode them (e.g., @ becomes %40).');
      console.log('     3. Database name:');
      console.log('        Ensure the URI ends with /user_profile_db?retryWrites=true&w=majority');
    } else {
      console.log('  👉 Check that your MONGO_URI format in server/.env is valid.');
    }
    console.log('='.repeat(55) + '\n');
    process.exit(1);
  }
}

testConnection();

