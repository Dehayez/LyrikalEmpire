const { handleQuery } = require('../helpers/dbHelpers');

const getKeywords = (req, res) => {
  handleQuery('SELECT * FROM keywords', [], res, null, true);
};

const createKeyword = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO keywords (name) VALUES (?)', [name], res, 'Keyword added successfully');
};

const updateKeyword = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE keywords SET name = ? WHERE id = ?', [name, id], res, 'Keyword updated successfully');
};

const deleteKeyword = (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM keywords WHERE id = ?', [id], res, 'Keyword deleted successfully');
};

module.exports = {
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword
};