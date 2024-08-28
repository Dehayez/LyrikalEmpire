const db = require('../config/db');

const handleQuery = async (query, params, res, successMessage, returnResultsOnly = false) => {
  try {
    const [results] = await db.query(query, params);
    if (returnResultsOnly) {
      return res.json(results);
    }
    res.json({ message: successMessage, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

const handleTransaction = async (queries, res, successMessage) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const { query, params } of queries) {
      await connection.query(query, params);
    }
    await connection.commit();
    res.json({ message: successMessage });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the transaction' });
  } finally {
    connection.release();
  }
};

module.exports = { handleQuery, handleTransaction };