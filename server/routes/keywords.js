const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Keywords
router.get('/', (req, res) => {
  db.query('SELECT * FROM keywords', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching keywords' });
    } else {
      res.json(results);
    }
  });
});

// Add Keyword
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query('INSERT INTO keywords (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the keyword' });
    } else {
      res.status(201).json({ message: 'Keyword added successfully', keywordId: results.insertId });
    }
  });
});

// Update Keyword
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE keywords SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the keyword' });
    } else {
      res.json({ message: 'Keyword updated successfully' });
    }
  });
});

// Delete Keyword
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM keywords WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the keyword' });
    } else {
      res.json({ message: 'Keyword deleted successfully' });
    }
  });
});

module.exports = router;