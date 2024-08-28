const { handleQuery } = require('../helpers/dbHelpers');

const getFeatures = (req, res) => {
  handleQuery('SELECT * FROM features', [], res, null, true);
};

const createFeature = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO features (name) VALUES (?)', [name], res, 'Feature added successfully');
};

const updateFeature = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE features SET name = ? WHERE id = ?', [name, id], res, 'Feature updated successfully');
};

const deleteFeature = (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM features WHERE id = ?', [id], res, 'Feature deleted successfully');
};

module.exports = {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature
};