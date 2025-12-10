require('express-async-errors');
require('dotenv').config({ path: './config/config.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:5173',
    credentials: true,
  },
  pingTimeout: 60000,
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room: ${room}`);
  });
  
  socket.on('shipmentUpdate', (data) => {
    socket.broadcast.emit('shipmentUpdated', data);
    logger.info(`Shipment update broadcasted: ${data.shipmentId}`);
  });
  
  socket.on('inventoryUpdate', (data) => {
    socket.broadcast.emit('inventoryUpdated', data);
    logger.info(`Inventory update broadcasted: ${data.itemId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Routes
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const inventoryRoutes = require('./routes/inventory');
const warehouseRoutes = require('./routes/warehouses');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NGO Logistics API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
      },
      shipments: {
        list: 'GET /api/shipments',
        create: 'POST /api/shipments',
        update: 'PUT /api/shipments/:id',
        delete: 'DELETE /api/shipments/:id',
        stats: 'GET /api/shipments/stats',
      },
      inventory: {
        list: 'GET /api/inventory',
        create: 'POST /api/inventory',
        update: 'PUT /api/inventory/:id',
        delete: 'DELETE /api/inventory/:id',
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect to FerretDB (MongoDB compatible layer over SQLite)
const connectDB = async () => {
  try {
    // FerretDB uses MongoDB wire protocol, so we can use mongoose
    await mongoose.connect(process.env.FERRETDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('Connected to FerretDB (SQLite backend)');
    
    // Create indexes
    await Promise.all([
      mongoose.model('Shipment').createIndexes(),
      mongoose.model('Inventory').createIndexes(),
      mongoose.model('User').createIndexes(),
      mongoose.model('Warehouse').createIndexes(),
    ]);
    
    logger.info('Database indexes created');
  } catch (err) {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Socket.IO server ready`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info(`API Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

startServer();

module.exports = { app, io };
