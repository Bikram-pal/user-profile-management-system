require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const { isDBConnected } = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin === clientUrl ||
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

// Root route
app.get('/', (req, res) => {
  const connected = isDBConnected();
  const currentPort = process.env.PORT || 5001;
  res.json({
    name: 'User Profile Management System API',
    status: 'Running',
    database: connected ? 'Connected to MongoDB Atlas' : 'Disconnected',
    endpoints: {
      health: `http://localhost:${currentPort}/api/health`,
      auth: `http://localhost:${currentPort}/api/auth`,
      users: `http://localhost:${currentPort}/api/users`,
    },
    clientApp: 'http://localhost:5173',
  });
});

// Health check with DB status
app.get('/api/health', (req, res) => {
  const connected = isDBConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'healthy' : 'degraded',
    database: {
      connected,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  });
});
