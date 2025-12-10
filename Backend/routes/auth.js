import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // For demo purposes - in real app, this would validate against database
    if (email === 'admin@example.org' && password === 'password123') {
      const payload = {
        id: 1,
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        organization: 'NGO Logistics',
        role: 'admin'
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '90d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token: 'Bearer ' + token,
            user: payload
          });
        }
      );
    } else {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, organization, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      organization,
      role
    });

    await user.save();

    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      role: user.role
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '90d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          success: true,
          token: 'Bearer ' + token,
          user: payload
        });
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This would use auth middleware in real implementation
    res.json({
      user: {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.org',
        organization: 'NGO Logistics',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
