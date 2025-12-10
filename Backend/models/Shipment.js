import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: [true, 'Source warehouse is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  items: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'delayed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
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

// Indexes for efficient queries
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ organization: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ priority: 1 });
shipmentSchema.index({ createdAt: -1 });

// Virtual for shipment duration
shipmentSchema.virtual('duration').get(function() {
  if (!this.actualDelivery || !this.createdAt) return null;
  return Math.floor((this.actualDelivery - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get shipment statistics
shipmentSchema.statics.getStatistics = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: organizationId } },
    {
      $group: {
        _id: null,
        totalShipments: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inTransitCount: {
          $sum: { $cond: [{ $eq: ['$status', 'in-transit'] }, 1, 0] }
        },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        delayedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] }
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        highPriorityCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        criticalPriorityCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalShipments: 0,
    pendingCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    delayedCount: 0,
    cancelledCount: 0,
    highPriorityCount: 0,
    criticalPriorityCount: 0
  };
};

// Instance method to update shipment status
shipmentSchema.methods.updateStatus = async function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
  }
  
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
  }
  
  await this.save();
  return this;
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;
