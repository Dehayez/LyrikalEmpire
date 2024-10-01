const { handleQuery } = require('../helpers/dbHelpers');

const getLyricsById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM lyrics WHERE id = ?';
  const params = [id];

  handleQuery(query, params, res, null, true);
};

module.exports = {
  getLyricsById,
};