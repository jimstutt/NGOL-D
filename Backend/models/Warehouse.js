const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Warehouse location is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Warehouse capacity is required'],
    min: [1, 'Capacity must be at least 1 square meter']
  },
  transport: {
    type: String,
    required: [true, 'Transport provider is required'],
    enum: [
      'Local Trucking Co.',
      'Regional Logistics', 
      'Air Cargo Partners',
      'Maritime Shipping',
      'Multiple Providers'
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'full'],
    default: 'operational'
  },
  utilization: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
warehouseSchema.index({ location: 1 });
warehouseSchema.index({ organization: 1 });
warehouseSchema.index({ status: 1 });
warehouseSchema.index({ utilization: 1 });

// Virtual for current capacity status
warehouseSchema.virtual('capacityStatus').get(function() {
  if (this.utilization >= 95) return 'Critical';
  if (this.utilization >= 80) return 'High';
  if (this.utilization >= 50) return 'Medium';
  return 'Low';
});

// Static method to get warehouse statistics
warehouseSchema.statics.getStatistics = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: organizationId } },
    {
      $group: {
        _id: null,
        totalWarehouses: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        avgUtilization: { $avg: '$utilization' },
        operationalCount: {
          $sum: { $cond: [{ $eq: ['$status', 'operational'] }, 1, 0] }
        },
        maintenanceCount: {
          $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
        },
        fullCount: {
          $sum: { $cond: [{ $eq: ['$status', 'full'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalWarehouses: 0,
    totalCapacity: 0,
    avgUtilization: 0,
    operationalCount: 0,
    maintenanceCount: 0,
    fullCount: 0
  };
};

// Instance method to check if warehouse can accept more items
warehouseSchema.methods.canAcceptItems = function(requiredCapacity) {
  const availableCapacity = this.capacity * (1 - (this.utilization / 100));
  return availableCapacity >= requiredCapacity;
};

// Middleware to validate coordinates
warehouseSchema.pre('save', function(next) {
  if ((this.latitude && !this.longitude) || (!this.latitude && this.longitude)) {
    next(new Error('Both latitude and longitude must be provided together'));
  }
  next();
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
