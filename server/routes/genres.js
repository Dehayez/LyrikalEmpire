const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Genres
router.get('/', (req, res) => {
  db.query('SELECT * FROM genres', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching genres' });
    } else {
      res.json(results);
    }
  });
});

// Add Genre
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query('INSERT INTO genres (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the genre' });
    } else {
      res.status(201).json({ message: 'Genre added successfully', genreId: results.insertId });
    }
  });
});

// Update Genre
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE genres SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the genre' });
    } else {
      res.json({ message: 'Genre updated successfully' });
    }
  });
});

// Delete Genre
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM genres WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the genre' });
    } else {
      res.json({ message: 'Genre deleted successfully' });
    }
  });
});

module.exports = router;