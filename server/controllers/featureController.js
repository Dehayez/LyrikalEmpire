const { handleQuery } = require('../helpers/dbHelpers');

const getFeatures = (req, res) => {
  handleQuery('SELECT * FROM features', [], res, null, true);
};

const getFeaturesWithCounts = (req, res) => {
  const query = `
    SELECT f.id, f.name, COUNT(bf.beat_id) as count
    FROM features f
    LEFT JOIN beats_features bf ON f.id = bf.feature_id
    GROUP BY f.id, f.name
    ORDER BY count DESC
  `;
  handleQuery(query, [], res, 'Features with counts fetched successfully', true);
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
  getFeaturesWithCounts,
  createFeature,
  updateFeature,
  deleteFeature,
};