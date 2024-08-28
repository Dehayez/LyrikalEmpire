const express = require('express');
const router = express.Router();
const { handleQuery } = require('../helpers/dbHelpers');

router.get('/', (req, res) => {
  handleQuery('SELECT * FROM genres', [], res, null, true);
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO genres (name) VALUES (?)', [name], res, 'Genre added successfully');
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE genres SET name = ? WHERE id = ?', [name, id], res, 'Genre updated successfully');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM genres WHERE id = ?', [id], res, 'Genre deleted successfully');
});

module.exports = router;