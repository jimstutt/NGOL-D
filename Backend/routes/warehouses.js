
const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/warehouses
// @desc    Get all warehouses for organization
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ organization: req.user.organization })
      .populate('createdBy', 'name email')
      .sort({ location: 1 });

    res.json({
      success: true,
      count: warehouses.length,
      data: warehouses
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching warehouses'
    });
  }
});

// @route   GET /api/warehouses/:id
// @desc    Get single warehouse
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('createdBy', 'name email');

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching warehouse'
    });
  }
});

// @route   POST /api/warehouses
// @desc    Create new warehouse
// @access  Private
router.post('/', [
  auth,
  [
    check('location', 'Location is required').not().isEmpty(),
    check('capacity', 'Capacity is required and must be positive').isFloat({ min: 1 }),
    check('transport', 'Transport provider is required').not().isEmpty(),
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
      location,
      capacity,
      transport,
      email,
      phone,
      latitude,
      longitude,
      status,
      utilization,
      notes
    } = req.body;

    // Check if warehouse already exists in same location
    const existingWarehouse = await Warehouse.findOne({
      location,
      organization: req.user.organization
    });

    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse already exists in this location'
      });
    }

    const warehouse = new Warehouse({
      location,
      capacity,
      transport,
      email,
      phone,
      latitude,
      longitude,
      status: status || 'operational',
      utilization: utilization || 0,
      notes,
      organization: req.user.organization,
      createdBy: req.user.id
    });

    await warehouse.save();
    await warehouse.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating warehouse'
    });
  }
});

// @route   PUT /api/warehouses/:id
// @desc    Update warehouse
// @access  Private
router.put('/:id', [
  auth,
  [
    check('location', 'Location is required').optional().not().isEmpty(),
    check('capacity', 'Capacity must be positive').optional().isFloat({ min: 1 }),
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
    let warehouse = await Warehouse.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Check if updating location to an existing one
    if (req.body.location && req.body.location !== warehouse.location) {
      const existingWarehouse = await Warehouse.findOne({
        location: req.body.location,
        organization: req.user.organization,
        _id: { $ne: req.params.id }
      });

      if (existingWarehouse) {
        return res.status(400).json({
          success: false,
          message: 'Another warehouse already exists in this location'
        });
      }
    }

    // Update warehouse
    const updateFields = { ...req.body };
    warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating warehouse'
    });
  }
});

// @route   DELETE /api/warehouses/:id
// @desc    Delete warehouse
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    await Warehouse.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting warehouse'
    });
  }
});

// @route   GET /api/warehouses/stats/summary
// @desc    Get warehouse statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Warehouse.getStatistics(req.user.organization);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching warehouse statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching warehouse statistics'
    });
  }
});

// @route   PATCH /api/warehouses/:id/utilization
// @desc    Update warehouse utilization
// @access  Private
router.patch('/:id/utilization', [
  auth,
  check('utilization', 'Utilization must be between 0 and 100').isFloat({ min: 0, max: 100 })
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
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    warehouse.utilization = req.body.utilization;
    await warehouse.save();
    await warehouse.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Warehouse utilization updated',
      data: warehouse
    });
  } catch (error) {
    console.error('Error updating warehouse utilization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating warehouse utilization'
    });
  }
});

// @route   GET /api/warehouses/map/locations
// @desc    Get warehouse locations for map
// @access  Private
router.get('/map/locations', auth, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({
      organization: req.user.organization,
      latitude: { $ne: null },
      longitude: { $ne: null }
    }).select('location latitude longitude utilization status capacity');

    const mapData = warehouses.map(warehouse => ({
      id: warehouse._id,
      location: warehouse.location,
      lat: warehouse.latitude,
      lng: warehouse.longitude,
      utilization: warehouse.utilization,
      status: warehouse.status,
      capacity: warehouse.capacity,
      capacityStatus: warehouse.capacityStatus
    }));

    res.json({
      success: true,
      data: mapData
    });
  } catch (error) {
    console.error('Error fetching warehouse map data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching warehouse map data'
    });
  }
});

module.exports = router;
