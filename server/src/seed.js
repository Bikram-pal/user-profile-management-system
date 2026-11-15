require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Error: MONGO_URI is missing in server/.env');
    process.exit(1);
  }

  console.log('Connecting to database for seeding...');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Clear existing users
    const deleteResult = await User.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing user(s).`);

    // Insert sample users
    const users = await User.create([
      {
        name: 'Admin',
        email: 'admin@upms.com',
        password: 'admin123',
        role: 'admin',
        phone: '9000000001',
        headline: 'Lead Platform Administrator',
        bio: 'Managing user access, security permissions, and core system configurations.',
        address: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
        socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
      },
      {
        name: 'Bikram Pal',
        email: 'bikram@upms.com',
        password: 'user123',
        role: 'user',
        phone: '9000000002',
        headline: 'Computer Science Student & Full Stack Explorer',
        bio: 'CSE student at UEM Kolkata passionate about building resilient MERN stack architectures and modern React UI.',
        dob: new Date('2002-05-15'),
        address: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
        socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com', website: 'https://example.com' },
      },
      {
        name: 'Test User',
        email: 'test@upms.com',
        password: 'user123',
        role: 'user',
        phone: '9000000003',
        headline: 'Software Quality Enthusiast',
        bio: 'Regular user profile used for testing permissions, updating attributes, and checking role access.',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      },
    ]);

    console.log(`\n✅ Successfully seeded ${users.length} users into collection "users"!\n`);
    console.log('---------------------------------------------------------');
    console.log('  DEFAULT LOGIN CREDENTIALS');
    console.log('---------------------------------------------------------');
    console.log('  Role   | Email            | Password');
    console.log('  -------+------------------+----------');
    console.log('  Admin  | admin@upms.com   | admin123');
    console.log('  User   | bikram@upms.com  | user123');
    console.log('  User   | test@upms.com    | user123');
    console.log('---------------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    console.error('👉 Make sure your MongoDB database is running and MONGO_URI in server/.env is correct.');
    console.error('👉 Run "npm run test-db" to check your connection.\n');
    process.exit(1);
  }
}

seed();
