// NGO Logistics — CJS, Express + Socket.IO, spec-compliant
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);  // ← HTTP server for Socket.IO

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.0' });
});

// Mock login (spec: ngoadmin@logistics.org / NgoAdmin123!)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'ngoadmin@logistics.org' && password === 'NgoAdmin123!') {
    const token = jwt.sign({ email, role: 'admin' }, 'dev-secret', { expiresIn: '1h' });
    res.json({ token, user: { email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Socket.IO (required by NGOLTechSpec.md: real-time updates)
const io = require('socket.io')(server, {
  cors: { origin: 'http://localhost:5173' }
});
io.on('connection', (socket) => {
  console.log('✅ Socket.IO connected');
  socket.on('disconnect', () => console.log('🔌 Socket.IO disconnected'));
});

// Start server on :3000
server.listen(3000, 'localhost', () => {
  console.log(`✅ Backend running on http://localhost:3000`);
});
