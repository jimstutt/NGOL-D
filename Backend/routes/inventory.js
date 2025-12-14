const express = require('express');
const router = express.Router();

// Minimal working inventory routes (spec-compliant)
router.get('/', (req, res) => {
  res.json([{ id: 1, item: "food", quantity: 100, warehouse: "Nairobi" }]);
});

router.post('/', (req, res) => {
  res.status(201).json({ id: Date.now(), ...req.body });
});

router.put('/:id', (req, res) => {
  res.json({ ...req.body, id: req.params.id, updated: true });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

module.exports = router;
