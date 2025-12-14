const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Mock login (spec requires JWT)
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
