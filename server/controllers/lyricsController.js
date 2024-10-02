const { handleQuery } = require('../helpers/dbHelpers');

const getLyricsById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM lyrics WHERE id = ?';
  const params = [id];

  handleQuery(query, params, res, null, true);
};

const updateLyricsById = (req, res) => {
  const { id } = req.params;
  const { lyrics } = req.body;
  const query = 'UPDATE lyrics SET lyrics = ? WHERE id = ?';
  const params = [lyrics, id];

  handleQuery(query, params, res, 'Lyrics updated successfully');
};

const createLyrics = (req, res) => {
  const { lyrics } = req.body;
  const query = 'INSERT INTO lyrics (lyrics) VALUES (?)';
  const params = [lyrics];

  handleQuery(query, params, res, 'Lyrics created successfully');
};

module.exports = {
  getLyricsById,
  updateLyricsById,
  createLyrics,
};