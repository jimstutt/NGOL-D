const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/transport
// @desc    Get all transport providers for organization
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, availability, page = 1, limit = 10 } = req.query;
    
    let query = { organization: req.user.organization };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by availability if provided
    if (availability) {
      query.availability = availability;
    }

    const transportProviders = await Transport.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transport.countDocuments(query);

    res.json({
      success: true,
      count: transportProviders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: transportProviders
    });
  } catch (error) {
    console.error('Error fetching transport providers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transport providers'
    });
  }
});

// @route   GET /api/transport/:id
// @desc    Get single transport provider
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transportProvider = await Transport.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('createdBy', 'name email');

    if (!transportProvider) {
      return res.status(404).json({
        success: false,
        message: 'Transport provider not found'
      });
    }

    res.json({
      success: true,
      data: transportProvider
    });
  } catch (error) {
    console.error('Error fetching transport provider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transport provider'
    });
  }
});

// @route   POST /api/transport
// @desc    Create new transport provider
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Provider name is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('type', 'Transport type is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const {
      name,
      location,
      email,
      phone,
      type,
      capacity,
      availability,
      rating,
      serviceAreas,
      vehicles,
      notes,
      status,
      contactPerson
    } = req.body;

    // Check if provider with same name and location already exists
    const existingProvider = await Transport.findOne({
      name,
      location,
      organization: req.user.organization
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Transport provider with this name and location already exists'
      });
    }

    const transportProvider = new Transport({
      name,
      location,
      email,
      phone,
      type,
      capacity: capacity || 0,
      availability: availability || 'available',
      rating: rating || 3,
      serviceAreas: serviceAreas || [],
      vehicles: vehicles || [],
      notes,
      status: status || 'active',
      contactPerson,
      organization: req.user.organization,
      createdBy: req.user.id
    });

    await transportProvider.save();
    await transportProvider.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Transport provider created successfully',
      data: transportProvider
    });
  } catch (error) {
    console.error('Error creating transport provider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating transport provider'
    });
  }
});

// @route   PUT /api/transport/:id
// @desc    Update transport provider
// @access  Private
router.put('/:id', [
  auth,
  [
    check('name', 'Provider name is required').optional().not().isEmpty(),
    check('location', 'Location is required').optional().not().isEmpty(),
    check('email', 'Valid email is required').optional().isEmail(),
    check('type', 'Transport type is required').optional().not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    let transportProvider = await Transport.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!transportProvider) {
      return res.status(404).json({
        success: false,
        message: 'Transport provider not found'
      });
    }

    // Check if updating to an existing name and location
    if ((req.body.name && req.body.name !== transportProvider.name) || 
        (req.body.location && req.body.location !== transportProvider.location)) {
      const existingProvider = await Transport.findOne({
        name: req.body.name || transportProvider.name,
        location: req.body.location || transportProvider.location,
        organization: req.user.organization,
        _id: { $ne: req.params.id }
      });

      if (existingProvider) {
        return res.status(400).json({
          success: false,
          message: 'Another transport provider with this name and location already exists'
        });
      }
    }

    // Update transport provider
    const updateFields = { ...req.body };
    transportProvider = await Transport.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Transport provider updated successfully',
      data: transportProvider
    });
  } catch (error) {
    console.error('Error updating transport provider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transport provider'
    });
  }
});

// @route   DELETE /api/transport/:id
// @desc    Delete transport provider
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transportProvider = await Transport.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!transportProvider) {
      return res.status(404).json({
        success: false,
        message: 'Transport provider not found'
      });
    }

    await Transport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transport provider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transport provider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting transport provider'
    });
  }
});

// @route   GET /api/transport/stats/summary
// @desc    Get transport provider statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Transport.getStatistics(req.user.organization);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transport statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transport statistics'
    });
  }
});

// @route   PATCH /api/transport/:id/availability
// @desc    Update transport provider availability
// @access  Private
router.patch('/:id/availability', [
  auth,
  check('availability', 'Valid availability status is required').isIn(['available', 'limited', 'unavailable', 'seasonal'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const transportProvider = await Transport.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!transportProvider) {
      return res.status(404).json({
        success: false,
        message: 'Transport provider not found'
      });
    }

    await transportProvider.updateAvailability(req.body.availability);
    await transportProvider.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Transport provider availability updated',
      data: transportProvider
    });
  } catch (error) {
    console.error('Error updating transport availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating transport availability'
    });
  }
});

// @route   GET /api/transport/available/:type/:area
// @desc    Find available transport providers by type and area
// @access  Private
router.get('/available/:type/:area', auth, async (req, res) => {
  try {
    const { type, area } = req.params;

    const availableProviders = await Transport.findAvailable(type, area, req.user.organization);

    res.json({
      success: true,
      count: availableProviders.length,
      data: availableProviders
    });
  } catch (error) {
    console.error('Error finding available transport providers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error finding available transport providers'
    });
  }
});

// @route   GET /api/transport/search
// @desc    Search transport providers
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type, area } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      organization: req.user.organization,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    if (type) {
      query.type = type;
    }

    if (area) {
      query.serviceAreas = area;
    }

    const transportProviders = await Transport.find(query)
      .populate('createdBy', 'name email')
      .limit(20);

    res.json({
      success: true,
      count: transportProviders.length,
      data: transportProviders
    });
  } catch (error) {
    console.error('Error searching transport providers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching transport providers'
    });
  }
});

module.exports = router;
export default router;
