const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Moods
router.get('/', (req, res) => {
  db.query('SELECT * FROM moods', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching moods' });
    } else {
      res.json(results);
    }
  });
});

// Add Mood
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query('INSERT INTO moods (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the mood' });
    } else {
      res.status(201).json({ message: 'Mood added successfully', moodId: results.insertId });
    }
  });
});

// Update Mood
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE moods SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the mood' });
    } else {
      res.json({ message: 'Mood updated successfully' });
    }
  });
});

// Delete Mood
router.delete('/api/moods/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM moods WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the mood' });
    } else {
      res.json({ message: 'Mood deleted successfully' });
    }
  });
});

module.exports = router;