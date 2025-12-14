// NGO Logistics Backend — CommonJS (Express 4.18.2 compatible)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');

// Load environment
dotenv.config();

const app = express();
const server = http.createServer(app);

// Routes (CJS requires)
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const shipmentRoutes = require('./routes/shipments');
const { initShipmentSockets } = require('./sockets/shipmentSockets');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shipments', shipmentRoutes);

// Socket.IO
initShipmentSockets(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`✅ NGO Logistics Backend running on http://localhost:${PORT}`);
});
