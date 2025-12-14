const express = require('express');
const router = express.Router();

// GET /api/shipments
router.get('/', (req, res) => {
  res.json([
    { id: 1, source: "Nairobi", destination: "Dadaab", status: "in-transit", priority: "high" },
    { id: 2, source: "Mombasa", destination: "Kakuma", status: "pending", priority: "medium" },
    { id: 3, source: "Kisumu", destination: "Lokichoggio", status: "delayed", priority: "low" }
  ]);
});

// POST /api/shipments
router.post('/', (req, res) => {
  const { source, destination, quantity } = req.body;
  if (!source || !destination || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid shipment data' });
  }
  res.status(201).json({ id: Date.now(), ...req.body, status: 'pending' });
});

// PUT /api/shipments/:id
router.put('/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body, updated: true });
});

// DELETE /api/shipments/:id
router.delete('/:id', (req, res) => {
  res.status(204).send();
});

module.exports = router;
