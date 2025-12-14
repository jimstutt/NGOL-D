const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, warehouse: "Nairobi", item: "Food", quantity: 1000 },
    { id: 2, warehouse: "Mombasa", item: "Water", quantity: 500 },
    { id: 3, warehouse: "Kisumu", item: "Medical", quantity: 200 }
  ]);
});

router.post('/', (req, res) => {
  res.status(201).json({ id: Date.now(), ...req.body });
});

router.put('/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body, updated: true });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

module.exports = router;
