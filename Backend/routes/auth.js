const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Mock profile (spec: ngoadmin@logistics.org / NgoAdmin123!)
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    id: 1,
    email: req.user.email,
    role: req.user.role || 'admin',
    firstName: 'NGO',
    lastName: 'Admin',
    organization: 'NGO Logistics'
  });
});

// Login (JWT)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'ngoadmin@logistics.org' && password === 'NgoAdmin123!') {
    const token = require('jsonwebtoken').sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );
    res.json({ token, user: { email, role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
