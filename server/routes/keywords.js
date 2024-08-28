const express = require('express');
const router = express.Router();
const { handleQuery } = require('../helpers/dbHelpers');

router.get('/', (req, res) => {
  handleQuery('SELECT * FROM keywords', [], res, null, true);
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO keywords (name) VALUES (?)', [name], res, 'Keyword added successfully');
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE keywords SET name = ? WHERE id = ?', [name, id], res, 'Keyword updated successfully');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM keywords WHERE id = ?', [id], res, 'Keyword deleted successfully');
});

module.exports = router;