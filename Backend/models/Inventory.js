import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inventory item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Water', 'Medical', 'Sanitary', 'Clothing', 'Bedding', 'Shelter', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'liters', 'pieces', 'boxes', 'pallets', 'units'],
    default: 'pieces'
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    min: [0, 'Minimum stock level cannot be negative'],
    default: 0
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  location: {
    aisle: String,
    shelf: String,
    bin: String
  },
  expiryDate: Date,
  batchNumber: String,
  status: {
    type: String,
    enum: ['active', 'low-stock', 'out-of-stock', 'expired', 'quarantined'],
    default: 'active'
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
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ organization: 1 });
inventorySchema.index({ name: 'text', description: 'text' });

// Virtual for total value
inventorySchema.virtual('totalValue').get(function() {
  return this.quantity * this.unitCost;
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStockLevel) return 'low-stock';
  if (this.expiryDate && this.expiryDate < new Date()) return 'expired';
  return 'active';
});

// Static method to get inventory statistics
inventorySchema.statics.getStatistics = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: organizationId } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitCost'] } },
        lowStockCount: {
          $sum: {
            $cond: [
              { $and: [
                { $gt: ['$quantity', 0] },
                { $lte: ['$quantity', '$minStockLevel'] }
              ]},
              1,
              0
            ]
          }
        },
        outOfStockCount: {
          $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
        },
        byCategory: {
          $push: {
            category: '$category',
            quantity: '$quantity',
            value: { $multiply: ['$quantity', '$unitCost'] }
          }
        }
      }
    },
    {
      $project: {
        totalItems: 1,
        totalQuantity: 1,
        totalValue: { $round: ['$totalValue', 2] },
        lowStockCount: 1,
        outOfStockCount: 1,
        categoryBreakdown: {
          $arrayToObject: {
            $map: {
              input: ['Food', 'Water', 'Medical', 'Sanitary', 'Clothing', 'Bedding', 'Shelter', 'Other'],
              as: 'cat',
              in: {
                k: '$$cat',
                v: {
                  count: {
                    $size: {
                      $filter: {
                        input: '$byCategory',
                        as: 'item',
                        cond: { $eq: ['$$item.category', '$$cat'] }
                      }
                    }
                  },
                  quantity: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byCategory',
                            as: 'item',
                            cond: { $eq: ['$$item.category', '$$cat'] }
                          }
                        },
                        as: 'catItem',
                        in: '$$catItem.quantity'
                      }
                    }
                  },
                  value: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$byCategory',
                            as: 'item',
                            cond: { $eq: ['$$item.category', '$$cat'] }
                          }
                        },
                        as: 'catItem',
                        in: '$$catItem.value'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoryBreakdown: {
      Food: { count: 0, quantity: 0, value: 0 },
      Water: { count: 0, quantity: 0, value: 0 },
      Medical: { count: 0, quantity: 0, value: 0 },
      Sanitary: { count: 0, quantity: 0, value: 0 },
      Clothing: { count: 0, quantity: 0, value: 0 },
      Bedding: { count: 0, quantity: 0, value: 0 },
      Shelter: { count: 0, quantity: 0, value: 0 },
      Other: { count: 0, quantity: 0, value: 0 }
    }
  };
};

// Middleware to update status based on quantity and expiry
inventorySchema.pre('save', function(next) {
  // Update status based on quantity and minStockLevel
  if (this.quantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low-stock';
  } else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
