const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/partners
// @desc    Get all partners for organization
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    let query = { organization: req.user.organization };
    
    // Filter by type if provided
    if (type) {
      query.partnershipType = type;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const partners = await Partner.find(query)
      .populate('createdBy', 'name email')
      .sort({ organization: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      count: partners.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: partners
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partners'
    });
  }
});

// @route   GET /api/partners/:id
// @desc    Get single partner
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const partner = await Partner.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('createdBy', 'name email');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partner'
    });
  }
});

// @route   POST /api/partners
// @desc    Create new partner
// @access  Private
router.post('/', [
  auth,
  [
    check('organization', 'Organization name is required').not().isEmpty(),
    check('contactName', 'Contact name is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty()
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
      organization,
      contactName,
      address,
      email,
      phone,
      notes,
      status,
      partnershipType,
      partnershipStart,
      partnershipEnd,
      rating,
      services
    } = req.body;

    // Check if partner with same email already exists
    const existingPartner = await Partner.findOne({
      email,
      organization: req.user.organization
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }

    const partner = new Partner({
      organization,
      contactName,
      address,
      email,
      phone,
      notes,
      status: status || 'active',
      partnershipType: partnershipType || 'logistics',
      partnershipStart: partnershipStart || new Date(),
      partnershipEnd,
      rating: rating || 3,
      services: services || [],
      organization: req.user.organization,
      createdBy: req.user.id
    });

    await partner.save();
    await partner.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: partner
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating partner'
    });
  }
});

// @route   PUT /api/partners/:id
// @desc    Update partner
// @access  Private
router.put('/:id', [
  auth,
  [
    check('organization', 'Organization name is required').optional().not().isEmpty(),
    check('contactName', 'Contact name is required').optional().not().isEmpty(),
    check('email', 'Valid email is required').optional().isEmail()
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
    let partner = await Partner.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Check if updating email to an existing one
    if (req.body.email && req.body.email !== partner.email) {
      const existingPartner = await Partner.findOne({
        email: req.body.email,
        organization: req.user.organization,
        _id: { $ne: req.params.id }
      });

      if (existingPartner) {
        return res.status(400).json({
          success: false,
          message: 'Another partner with this email already exists'
        });
      }
    }

    // Update partner
    const updateFields = { ...req.body };
    partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Partner updated successfully',
      data: partner
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating partner'
    });
  }
});

// @route   DELETE /api/partners/:id
// @desc    Delete partner
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const partner = await Partner.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    await Partner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting partner'
    });
  }
});

// @route   GET /api/partners/stats/summary
// @desc    Get partner statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Partner.getStatistics(req.user.organization);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching partner statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching partner statistics'
    });
  }
});

// @route   PATCH /api/partners/:id/rating
// @desc    Update partner rating
// @access  Private
router.patch('/:id/rating', [
  auth,
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 })
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
    const partner = await Partner.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    await partner.updateRating(req.body.rating);
    await partner.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Partner rating updated',
      data: partner
    });
  } catch (error) {
    console.error('Error updating partner rating:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating partner rating'
    });
  }
});

// @route   GET /api/partners/search
// @desc    Search partners
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      organization: req.user.organization,
      $or: [
        { organization: { $regex: q, $options: 'i' } },
        { contactName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    if (type) {
      query.partnershipType = type;
    }

    const partners = await Partner.find(query)
      .populate('createdBy', 'name email')
      .limit(20);

    res.json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (error) {
    console.error('Error searching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching partners'
    });
  }
});

module.exports = router;
export default router;
