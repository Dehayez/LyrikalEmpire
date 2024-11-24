const { handleQuery } = require('../helpers/dbHelpers');

const getKeywords = (req, res) => {
  handleQuery('SELECT * FROM keywords', [], res, null, true);
};

const getKeywordsWithCounts = (req, res) => {
  const query = `
    SELECT k.id, k.name, COUNT(bk.beat_id) as count
    FROM keywords k
    LEFT JOIN beats_keywords bk ON k.id = bk.keyword_id
    GROUP BY k.id, k.name
    ORDER BY count DESC
  `;
  handleQuery(query, [], res, 'Keywords with counts fetched successfully', true);
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
  getKeywordsWithCounts,
  createKeyword,
  updateKeyword,
  deleteKeyword,
};