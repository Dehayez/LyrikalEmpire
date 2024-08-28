const express = require('express');
const router = express.Router();
const { handleQuery } = require('../helpers/dbHelpers');

router.get('/', (req, res) => {
  handleQuery('SELECT * FROM features', [], res, null, true);
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO features (name) VALUES (?)', [name], res, 'Feature added successfully');
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE features SET name = ? WHERE id = ?', [name, id], res, 'Feature updated successfully');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM features WHERE id = ?', [id], res, 'Feature deleted successfully');
});

module.exports = router;