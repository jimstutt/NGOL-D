const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');
const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const Partner = require('../models/Partner');
const Transport = require('../models/Transport');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({ organization: req.user.organization })
      .select('-password')
      .populate('organization', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/users', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Valid role is required').isIn(['admin', 'logistics', 'field'])
  ]
], async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const { name, email, password, role, active = true } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      active,
      organization: req.user.organization
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password').populate('organization', 'name');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/users/:id', [
  auth,
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('role', 'Valid role is required').optional().isIn(['admin', 'logistics', 'field'])
  ]
], async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if updating email to an existing one
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
        organization: req.user.organization,
        _id: { $ne: req.params.id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Another user with this email already exists'
        });
      }
    }

    // Update user
    const updateFields = { ...req.body };
    if (updateFields.password) {
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password').populate('organization', 'name');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/users/:id', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// @route   POST /api/admin/users/:id/reset-password
// @desc    Reset user password (admin only)
// @access  Private/Admin
router.post('/users/:id/reset-password', [
  auth,
  check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
});

// @route   GET /api/admin/metrics
// @desc    Get system metrics (admin only)
// @access  Private/Admin
router.get('/metrics', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    const organizationId = req.user.organization;

    // Get counts from different collections
    const [
      userCount,
      activeUserCount,
      shipmentCount,
      inventoryCount,
      warehouseCount,
      partnerCount,
      transportCount
    ] = await Promise.all([
      User.countDocuments({ organization: organizationId }),
      User.countDocuments({ organization: organizationId, active: true }),
      Shipment.countDocuments({ organization: organizationId }),
      Inventory.countDocuments({ organization: organizationId }),
      Warehouse.countDocuments({ organization: organizationId }),
      Partner.countDocuments({ organization: organizationId }),
      Transport.countDocuments({ organization: organizationId })
    ]);

    // Get shipment status breakdown
    const shipmentStatus = await Shipment.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get inventory value and low stock items
    const inventoryStats = await Inventory.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$unitCost'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$minStockLevel'] }, 1, 0]
            }
          },
          totalItems: { $sum: '$quantity' }
        }
      }
    ]);

    // Get recent activities (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentActivities = await Shipment.countDocuments({
      organization: organizationId,
      createdAt: { $gte: weekAgo }
    });

    const metrics = {
      users: {
        total: userCount,
        active: activeUserCount,
        inactive: userCount - activeUserCount
      },
      shipments: {
        total: shipmentCount,
        byStatus: shipmentStatus.reduce((acc, status) => {
          acc[status._id] = status.count;
          return acc;
        }, {}),
        recent: recentActivities
      },
      inventory: {
        totalItems: inventoryCount,
        totalValue: inventoryStats[0]?.totalValue || 0,
        totalQuantity: inventoryStats[0]?.totalItems || 0,
        lowStock: inventoryStats[0]?.lowStockCount || 0
      },
      resources: {
        warehouses: warehouseCount,
        partners: partnerCount,
        transportProviders: transportCount
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching system metrics'
    });
  }
});

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs (admin only)
// @access  Private/Admin
router.get('/audit-logs', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    const { limit = 50, page = 1 } = req.query;

    // In a real application, you would have a separate AuditLog model
    // For now, we'll use recent shipments and user activities as audit logs
    const recentShipments = await Shipment.find({ organization: req.user.organization })
      .select('trackingNumber status createdAt updatedAt')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const recentUsers = await User.find({ organization: req.user.organization })
      .select('name email role lastLogin createdAt')
      .sort({ lastLogin: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Combine and format as audit logs
    const auditLogs = [
      ...recentShipments.map(shipment => ({
        type: 'shipment',
        action: shipment.createdAt.getTime() === shipment.updatedAt.getTime() ? 'created' : 'updated',
        description: `Shipment ${shipment.trackingNumber} ${shipment.status}`,
        user: shipment.createdBy?.name || 'System',
        timestamp: shipment.updatedAt,
        details: {
          trackingNumber: shipment.trackingNumber,
          status: shipment.status
        }
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        action: user.lastLogin ? 'login' : 'created',
        description: user.lastLogin ? `User ${user.name} logged in` : `User ${user.name} created`,
        user: user.name,
        timestamp: user.lastLogin || user.createdAt,
        details: {
          email: user.email,
          role: user.role
        }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, limit);

    res.json({
      success: true,
      count: auditLogs.length,
      data: auditLogs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching audit logs'
    });
  }
});

// @route   GET /api/admin/export/:dataType
// @desc    Export data (admin only)
// @access  Private/Admin
router.get('/export/:dataType', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    const { dataType } = req.params;
    const { format = 'json' } = req.query;
    const organizationId = req.user.organization;

    let data;
    let filename;

    switch (dataType) {
      case 'shipments':
        data = await Shipment.find({ organization: organizationId })
          .populate('createdBy', 'name')
          .populate('items.inventoryItem', 'name category');
        filename = 'shipments';
        break;

      case 'inventory':
        data = await Inventory.find({ organization: organizationId })
          .populate('warehouse', 'location');
        filename = 'inventory';
        break;

      case 'users':
        data = await User.find({ organization: organizationId })
          .select('-password')
          .populate('organization', 'name');
        filename = 'users';
        break;

      case 'warehouses':
        data = await Warehouse.find({ organization: organizationId })
          .populate('createdBy', 'name');
        filename = 'warehouses';
        break;

      case 'partners':
        data = await Partner.find({ organization: organizationId })
          .populate('createdBy', 'name');
        filename = 'partners';
        break;

      case 'transport':
        data = await Transport.find({ organization: organizationId })
          .populate('createdBy', 'name');
        filename = 'transport-providers';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid data type for export'
        });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}-${new Date().toISOString().split('T')[0]}.json`);
      res.send(JSON.stringify(data, null, 2));
    } else {
      // For CSV format, you would need to convert the data
      // This is a simplified version - in production, use a proper CSV library
      res.status(400).json({
        success: false,
        message: 'CSV export not implemented yet'
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting data'
    });
  }
});

// @route   GET /api/admin/organization
// @desc    Get organization details (admin only)
// @access  Private/Admin
router.get('/organization', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  try {
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching organization'
    });
  }
});

// @route   PUT /api/admin/organization
// @desc    Update organization details (admin only)
// @access  Private/Admin
router.put('/organization', [
  auth,
  [
    check('name', 'Organization name is required').optional().not().isEmpty(),
    check('contactEmail', 'Valid contact email is required').optional().isEmail()
  ]
], async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating organization'
    });
  }
});

module.exports = router;
export default router;
