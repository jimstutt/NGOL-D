const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  organization: {
    type: String,
    required: [true, 'Partner organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [50, 'Contact name cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    enum: [
      'Nairobi Main Office',
      'Mombasa Field Office', 
      'Kisumu Regional Office',
      'Garissa Operations',
      'Lodwar Base'
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
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
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
  partnershipType: {
    type: String,
    enum: ['logistics', 'supplier', 'recipient', 'financial', 'technical'],
    default: 'logistics'
  },
  partnershipStart: {
    type: Date,
    default: Date.now
  },
  partnershipEnd: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  services: [{
    type: String,
    enum: [
      'transportation',
      'storage', 
      'distribution',
      'funding',
      'technical_support',
      'volunteers',
      'supplies'
    ]
  }],
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
partnerSchema.index({ organization: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ partnershipType: 1 });
partnerSchema.index({ email: 1 }, { unique: true });
partnerSchema.index({ 'services': 1 });

// Virtual for partnership duration
partnerSchema.virtual('partnershipDuration').get(function() {
  const endDate = this.partnershipEnd || new Date();
  const startDate = this.partnershipStart;
  const durationMs = endDate - startDate;
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  return durationDays;
});

// Virtual for partnership status
partnerSchema.virtual('isActivePartnership').get(function() {
  if (this.status !== 'active') return false;
  if (!this.partnershipEnd) return true;
  return this.partnershipEnd > new Date();
});

// Static method to get partner statistics
partnerSchema.statics.getStatistics = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: organizationId } },
    {
      $group: {
        _id: null,
        totalPartners: { $sum: 1 },
        activePartners: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inactivePartners: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
        },
        suspendedPartners: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' },
        byType: {
          $push: {
            type: '$partnershipType',
            status: '$status'
          }
        }
      }
    },
    {
      $project: {
        totalPartners: 1,
        activePartners: 1,
        inactivePartners: 1,
        suspendedPartners: 1,
        avgRating: { $round: ['$avgRating', 2] },
        typeBreakdown: {
          logistics: {
            $size: {
              $filter: {
                input: '$byType',
                as: 'partner',
                cond: { $eq: ['$$partner.type', 'logistics'] }
              }
            }
          },
          supplier: {
            $size: {
              $filter: {
                input: '$byType',
                as: 'partner',
                cond: { $eq: ['$$partner.type', 'supplier'] }
              }
            }
          },
          recipient: {
            $size: {
              $filter: {
                input: '$byType',
                as: 'partner',
                cond: { $eq: ['$$partner.type', 'recipient'] }
              }
            }
          },
          financial: {
            $size: {
              $filter: {
                input: '$byType',
                as: 'partner',
                cond: { $eq: ['$$partner.type', 'financial'] }
              }
            }
          },
          technical: {
            $size: {
              $filter: {
                input: '$byType',
                as: 'partner',
                cond: { $eq: ['$$partner.type', 'technical'] }
              }
            }
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalPartners: 0,
    activePartners: 0,
    inactivePartners: 0,
    suspendedPartners: 0,
    avgRating: 0,
    typeBreakdown: {
      logistics: 0,
      supplier: 0,
      recipient: 0,
      financial: 0,
      technical: 0
    }
  };
};

// Instance method to update partner rating
partnerSchema.methods.updateRating = async function(newRating) {
  this.rating = newRating;
  await this.save();
};

// Middleware to handle partnership end date
partnerSchema.pre('save', function(next) {
  if (this.partnershipEnd && this.partnershipEnd < this.partnershipStart) {
    next(new Error('Partnership end date cannot be before start date'));
  }
  next();
});

// Method to check if partner can be contacted
partnerSchema.methods.canContact = function() {
  return this.status === 'active' && this.isActivePartnership;
};

module.exports = mongoose.model('Partner', partnerSchema);
