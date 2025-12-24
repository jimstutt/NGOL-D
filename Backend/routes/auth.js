const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email?.trim() === 'ngoadmin@logistics.org' && password?.trim() === 'NgoAdmin123!') {
    return res.json({
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.jwt.token',
      user: { id: 1, email: 'ngoadmin@logistics.org', role: 'admin' }
    });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

module.exports = router;
