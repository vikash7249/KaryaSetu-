const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { initSocket } = require('./utils/socket');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// Init Socket.io
const io = initSocket(httpServer);

// ===== MIDDLEWARE =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

// ===== API ROUTES =====
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/files',         require('./routes/files'));
app.use('/api/timelogs',      require('./routes/timelogs'));
app.use('/api/activitylogs',  require('./routes/activitylogs'));

// Serve local uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== SERVE REACT BUILD (Production) =====
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', app: 'KaryaSetu API', time: new Date() });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ===== DATABASE + START =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`KaryaSetu running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
