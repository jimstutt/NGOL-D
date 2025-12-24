#!/usr/bin/env node
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, 'config', 'config.env') });

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/inventory', require('./routes/inventory'));

// Socket.IO
const { Server } = require('socket.io');
app.use('/api/auth', require('./routes/auth'));
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket']
});

// Minimal socket stub (from spec: real-time via Socket.IO)
io.on('connection', (socket) => {
  console.log('✅ Socket.IO client connected');
  socket.on('disconnect', () => {
    console.log('🔌 Socket.IO client disconnected');
  });
});

// Start
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ NGOL-D Backend running on http://0.0.0.0:${PORT}`);
});
