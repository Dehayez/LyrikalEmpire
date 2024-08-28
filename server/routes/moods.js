const express = require('express');
const router = express.Router();
const { handleQuery } = require('../helpers/dbHelpers');

router.get('/', (req, res) => {
  handleQuery('SELECT * FROM moods', [], res, null, true);
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO moods (name) VALUES (?)', [name], res, 'Mood added successfully');
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE moods SET name = ? WHERE id = ?', [name, id], res, 'Mood updated successfully');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM moods WHERE id = ?', [id], res, 'Mood deleted successfully');
});

module.exports = router;