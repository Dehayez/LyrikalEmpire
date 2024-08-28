const db = require('../config/db');

const handleQuery = async (query, params, res, successMessage, returnResultsOnly = false) => {
  try {
    const [results] = await db.promise().query(query, params);
    if (returnResultsOnly) {
      return res.json(results);
    }
    res.json({ message: successMessage, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

module.exports = { handleQuery };