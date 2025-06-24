require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const apiRoutes = express.Router();
app.use('/api', apiRoutes);

apiRoutes.use('/auth', require('./routes/auth'));
apiRoutes.use('/games', require('./routes/game'));
apiRoutes.use('/wallet', require('./routes/wallet'));

// Health Check
apiRoutes.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: sequelize.config.database,
    dbStatus: sequelize.authenticate() ? 'connected' : 'disconnected'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  const response = {
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.status || 500).json(response);
});

// Database and Server Startup
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing database with alter...');
      await sequelize.sync({ alter: true });
    } else {
      console.log('Checking for pending migrations...');
      // In production, we should only use migrations
      const [_, migrations] = await sequelize.query(
        'SELECT name FROM SequelizeMeta ORDER BY name DESC LIMIT 1'
      );
      console.log(`Latest migration: ${migrations[0]?.name || 'none'}`);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function startServer() {
  try {
    const dbReady = await initializeDatabase();
    if (!dbReady) throw new Error('Database not ready');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${sequelize.config.database}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Start the server
const server = startServer();

// Export for testing
module.exports = { app, server };