#!/usr/bin/env node
// Backend/server.js — NGOL-D (MariaDB + Socket.IO + JWT)
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { setupSocket } = require('./socket.js');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check (required by CI)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start servers
const io = setupSocket(server);
server.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
