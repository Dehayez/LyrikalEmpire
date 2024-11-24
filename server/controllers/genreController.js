const { handleQuery } = require('../helpers/dbHelpers');

const getGenres = (req, res) => {
  handleQuery('SELECT * FROM genres', [], res, null, true);
};

const getGenresWithCounts = (req, res) => {
  const query = `
    SELECT g.id, g.name, COUNT(bg.beat_id) as count
    FROM genres g
    LEFT JOIN beats_genres bg ON g.id = bg.genre_id
    GROUP BY g.id, g.name
    ORDER BY count DESC
  `;
  handleQuery(query, [], res, 'Genres with counts fetched successfully', true);
};

const createGenre = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  handleQuery('INSERT INTO genres (name) VALUES (?)', [name], res, 'Genre added successfully');
};

const updateGenre = (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  handleQuery('UPDATE genres SET name = ? WHERE id = ?', [name, id], res, 'Genre updated successfully');
};

const deleteGenre = (req, res) => {
  const { id } = req.params;
  handleQuery('DELETE FROM genres WHERE id = ?', [id], res, 'Genre deleted successfully');
};

module.exports = {
  getGenres,
  getGenresWithCounts,
  createGenre,
  updateGenre,
  deleteGenre,
};