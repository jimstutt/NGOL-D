const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Kenya'
    },
    postalCode: String
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String // URL to logo image
  },
  settings: {
    defaultCurrency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'Africa/Nairobi'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
organizationSchema.index({ name: 1 });
organizationSchema.index({ status: 1 });

// Static method to get organization statistics
organizationSchema.statics.getStatistics = async function(organizationId) {
  // This would aggregate statistics from all collections
  // For now, return basic organization info
  return {
    organizationId,
    timestamp: new Date()
  };
};

module.exports = mongoose.model('Organization', organizationSchema);
