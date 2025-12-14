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
  res.status(200).json({ status: 'OK', version: '1.0.0' });
});

// Mock login (spec: ngoadmin@logistics.org / NgoAdmin123!)
const jwt = require('jsonwebtoken');
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'ngoadmin@logistics.org' && password === 'NgoAdmin123!') {
    const token = jwt.sign({ email, role: 'admin' }, 'dev-secret', { expiresIn: '1h' });
    res.json({ token, user: { email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Start
const PORT = 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
