import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Mock data - in real app, this would come from MongoDB
let shipments = [
  {
    id: 1,
    source: 'Nairobi Warehouse',
    description: 'Food Supplies',
    quantity: 1000,
    destination: 'Kakuma Camp',
    transport: 'Kenya Logistics',
    status: 'in-transit',
    coordinates: { lat: 3.7167, lng: 34.8667 },
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    source: 'Mombasa Warehouse',
    description: 'Medical Supplies',
    quantity: 500,
    destination: 'Dadaab Camp',
    transport: 'Coastal Transport',
    status: 'delayed',
    coordinates: { lat: 0.0500, lng: 40.3167 },
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    source: 'Kisumu Warehouse',
    description: 'Water Purification',
    quantity: 200,
    destination: 'Lodwar',
    transport: 'Lake Basin Transport',
    status: 'pending',
    coordinates: { lat: 3.1191, lng: 35.5973 },
    createdAt: new Date().toISOString()
  }
];

// @route   GET /api/shipments
// @desc    Get all shipments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.query;
    
    let filteredShipments = shipments;
    
    if (status) {
      filteredShipments = filteredShipments.filter(shipment => 
        shipment.status === status
      );
    }
    
    if (priority) {
      filteredShipments = filteredShipments.filter(shipment => 
        shipment.priority === priority
      );
    }
    
    if (startDate && endDate) {
      filteredShipments = filteredShipments.filter(shipment => {
        const shipmentDate = new Date(shipment.createdAt);
        return shipmentDate >= new Date(startDate) && shipmentDate <= new Date(endDate);
      });
    }
    
    res.json({
      success: true,
      data: filteredShipments,
      count: filteredShipments.length
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/shipments
// @desc    Create new shipment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { source, description, quantity, destination, transport, coordinates } = req.body;
    
    if (!source || !description || !quantity || !destination || !transport) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    const newShipment = {
      id: Date.now(),
      source,
      description,
      quantity: parseInt(quantity),
      destination,
      transport,
      coordinates: coordinates || { lat: 0, lng: 0 },
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    shipments.push(newShipment);
    
    res.status(201).json({
      success: true,
      data: newShipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/shipments/:id
// @desc    Update shipment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { source, description, quantity, destination, transport, coordinates, status } = req.body;
    
    const shipmentIndex = shipments.findIndex(shipment => shipment.id === parseInt(id));
    
    if (shipmentIndex === -1) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    shipments[shipmentIndex] = {
      ...shipments[shipmentIndex],
      source: source || shipments[shipmentIndex].source,
      description: description || shipments[shipmentIndex].description,
      quantity: quantity ? parseInt(quantity) : shipments[shipmentIndex].quantity,
      destination: destination || shipments[shipmentIndex].destination,
      transport: transport || shipments[shipmentIndex].transport,
      coordinates: coordinates || shipments[shipmentIndex].coordinates,
      status: status || shipments[shipmentIndex].status
    };
    
    res.json({
      success: true,
      data: shipments[shipmentIndex]
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/shipments/:id
// @desc    Delete shipment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const shipmentIndex = shipments.findIndex(shipment => shipment.id === parseInt(id));
    
    if (shipmentIndex === -1) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    shipments.splice(shipmentIndex, 1);
    
    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
