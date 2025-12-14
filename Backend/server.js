// NGO Logistics Backend — Minimal Working CJS (per NGOLTechSpec.md)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check (required by spec)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Socket.IO (spec requirement: real-time updates)
const io = require('socket.io')(server, {
  cors: { origin: ['http://localhost:5173'] }
});
io.on('connection', (socket) => {
  console.log('✅ Socket.IO client connected');
  socket.on('disconnect', () => console.log('🔌 Socket.IO client disconnected'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`✅ NGO Logistics Backend running on http://localhost:${PORT}`);
});
