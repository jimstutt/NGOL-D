const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Transport provider name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
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
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  type: {
    type: String,
    required: [true, 'Transport type is required'],
    enum: [
      'Road Trucking',
      'Air Cargo',
      'Maritime', 
      'Rail',
      'Motorcycle',
      'Multiple Modes'
    ]
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0
  },
  availability: {
    type: String,
    enum: ['available', 'limited', 'unavailable', 'seasonal'],
    default: 'available'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  serviceAreas: [{
    type: String,
    enum: [
      'Nairobi Region',
      'Coastal Region', 
      'Western Kenya',
      'Northern Kenya',
      'Rift Valley',
      'Central Kenya',
      'International'
    ]
  }],
  vehicles: [{
    type: {
      type: String,
      enum: ['truck', 'van', 'motorcycle', 'aircraft', 'ship', 'train']
    },
    capacity: Number,
    registration: String,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'out_of_service'],
      default: 'operational'
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  contactPerson: {
    name: String,
    position: String,
    mobile: String
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

// Indexes for efficient queries
transportSchema.index({ organization: 1 });
transportSchema.index({ type: 1 });
transportSchema.index({ availability: 1 });
transportSchema.index({ status: 1 });
transportSchema.index({ 'serviceAreas': 1 });
transportSchema.index({ rating: -1 });

// Virtual for total vehicle capacity
transportSchema.virtual('totalCapacity').get(function() {
  return this.vehicles.reduce((total, vehicle) => {
    return total + (vehicle.capacity || 0);
  }, this.capacity || 0);
});

// Virtual for operational vehicles count
transportSchema.virtual('operationalVehicles').get(function() {
  return this.vehicles.filter(vehicle => vehicle.status === 'operational').length;
});

// Static method to get transport statistics
transportSchema.statics.getStatistics = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: organizationId } },
    {
      $group: {
        _id: null,
        totalProviders: { $sum: 1 },
        activeProviders: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        availableProviders: {
          $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' },
        totalCapacity: { $sum: '$capacity' },
        byType: {
          $push: {
            type: '$type',
            availability: '$availability',
            capacity: '$capacity'
          }
        }
      }
    },
    {
      $project: {
        totalProviders: 1,
        activeProviders: 1,
        availableProviders: 1,
        avgRating: { $round: ['$avgRating', 2] },
        totalCapacity: 1,
        typeBreakdown: {
          roadTrucking: {
            count: {
              $size: {
                $filter: {
                  input: '$byType',
                  as: 'provider',
                  cond: { $eq: ['$$provider.type', 'Road Trucking'] }
                }
              }
            },
            capacity: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$byType',
                      as: 'provider',
                      cond: { $eq: ['$$provider.type', 'Road Trucking'] }
                    }
                  },
                  as: 'road',
                  in: '$$road.capacity'
                }
              }
            }
          },
          airCargo: {
            count: {
              $size: {
                $filter: {
                  input: '$byType',
                  as: 'provider',
                  cond: { $eq: ['$$provider.type', 'Air Cargo'] }
                }
              }
            },
            capacity: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$byType',
                      as: 'provider',
                      cond: { $eq: ['$$provider.type', 'Air Cargo'] }
                    }
                  },
                  as: 'air',
                  in: '$$air.capacity'
                }
              }
            }
          },
          maritime: {
            count: {
              $size: {
                $filter: {
                  input: '$byType',
                  as: 'provider',
                  cond: { $eq: ['$$provider.type', 'Maritime'] }
                }
              }
            },
            capacity: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$byType',
                      as: 'provider',
                      cond: { $eq: ['$$provider.type', 'Maritime'] }
                    }
                  },
                  as: 'sea',
                  in: '$$sea.capacity'
                }
              }
            }
          },
          rail: {
            count: {
              $size: {
                $filter: {
                  input: '$byType',
                  as: 'provider',
                  cond: { $eq: ['$$provider.type', 'Rail'] }
                }
              }
            },
            capacity: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$byType',
                      as: 'provider',
                      cond: { $eq: ['$$provider.type', 'Rail'] }
                    }
                  },
                  as: 'rail',
                  in: '$$rail.capacity'
                }
              }
            }
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalProviders: 0,
    activeProviders: 0,
    availableProviders: 0,
    avgRating: 0,
    totalCapacity: 0,
    typeBreakdown: {
      roadTrucking: { count: 0, capacity: 0 },
      airCargo: { count: 0, capacity: 0 },
      maritime: { count: 0, capacity: 0 },
      rail: { count: 0, capacity: 0 }
    }
  };
};

// Instance method to check if provider serves area
transportSchema.methods.servesArea = function(area) {
  return this.serviceAreas.includes(area);
};

// Instance method to update availability
transportSchema.methods.updateAvailability = async function(newAvailability) {
  this.availability = newAvailability;
  await this.save();
};

// Static method to find available providers by type and area
transportSchema.statics.findAvailable = function(type, area, organizationId) {
  return this.find({
    organization: organizationId,
    status: 'active',
    availability: { $in: ['available', 'limited'] },
    type: type,
    serviceAreas: area
  }).sort({ rating: -1 });
};

// Middleware to validate capacity
transportSchema.pre('save', function(next) {
  if (this.capacity < 0) {
    next(new Error('Capacity cannot be negative'));
  }
  next();
});

module.exports = mongoose.model('Transport', transportSchema);
