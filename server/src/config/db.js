const mongoose = require('mongoose');

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ FATAL: MONGO_URI is not set in server/.env');
    console.error('👉 Please configure your MongoDB connection string in server/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('\n❌ MongoDB connection failed:', err.message);
    console.error('👉 Tip: Run "npm run test-db" to diagnose connection issues.\n');
    process.exit(1);
  }
}

function isDBConnected() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
}

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
