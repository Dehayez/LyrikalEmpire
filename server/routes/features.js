const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Features
router.get('/', (req, res) => {
  db.query('SELECT * FROM features', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching features' });
    } else {
      res.json(results);
    }
  });
});

// Add Feature
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query('INSERT INTO features (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the feature' });
    } else {
      res.status(201).json({ message: 'Feature added successfully', featureId: results.insertId });
    }
  });
});

// Update Feature
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE features SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the feature' });
    } else {
      res.json({ message: 'Feature updated successfully' });
    }
  });
});

// Delete Feature
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM features WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the feature' });
    } else {
      res.json({ message: 'Feature deleted successfully' });
    }
  });
});

module.exports = router;