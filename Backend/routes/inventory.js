const express = require('express');
const { auth } = require('../middleware/auth.js');

const router = express.Router();

// Mock data - in real app, this would come from MongoDB
let inventory = [
  {
    id: 1,
    warehouse: 'Nairobi Warehouse',
    description: 'Food',
    quantity: 15000,
    transport: 'Kenya Logistics',
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    warehouse: 'Mombasa Warehouse',
    description: 'Medical',
    quantity: 8000,
    transport: 'Coastal Transport',
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    warehouse: 'Kisumu Warehouse',
    description: 'Water',
    quantity: 12000,
    transport: 'Lake Basin Transport',
    status: 'low-stock',
    createdAt: new Date().toISOString()
  }
];

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { warehouse, status } = req.query;
    
    let filteredInventory = inventory;
    
    if (warehouse) {
      filteredInventory = filteredInventory.filter(item => 
        item.warehouse.toLowerCase().includes(warehouse.toLowerCase())
      );
    }
    
    if (status) {
      filteredInventory = filteredInventory.filter(item => 
        item.status === status
      );
    }
    
    res.json({
      success: true,
      data: filteredInventory,
      count: filteredInventory.length
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { warehouse, description, quantity, transport } = req.body;
    
    if (!warehouse || !description || !quantity || !transport) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    const newItem = {
      id: Date.now(),
      warehouse,
      description,
      quantity: parseInt(quantity),
      transport,
      status: quantity > 1000 ? 'available' : 'low-stock',
      createdAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse, description, quantity, transport } = req.body;
    
    const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      warehouse: warehouse || inventory[itemIndex].warehouse,
      description: description || inventory[itemIndex].description,
      quantity: quantity ? parseInt(quantity) : inventory[itemIndex].quantity,
      transport: transport || inventory[itemIndex].transport,
      status: quantity > 1000 ? 'available' : 'low-stock'
    };
    
    res.json({
      success: true,
      data: inventory[itemIndex]
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    inventory.splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
