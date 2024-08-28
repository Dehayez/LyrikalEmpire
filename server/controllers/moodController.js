const { handleQuery } = require('../helpers/dbHelpers');

const getMoods = (req, res) => {
  handleQuery('SELECT * FROM moods', [], res, null, true);
};

const createMood = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO moods (name) VALUES (?)', [name], res, 'Mood added successfully');
};

const updateMood = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE moods SET name = ? WHERE id = ?', [name, id], res, 'Mood updated successfully');
};

const deleteMood = (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM moods WHERE id = ?', [id], res, 'Mood deleted successfully');
};

module.exports = {
  getMoods,
  createMood,
  updateMood,
  deleteMood
};