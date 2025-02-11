const mysql = require('mysql2/promise');
// Local Server
require('dotenv').config({ path: '../.env' });

// Third Server
//require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

module.exports = db;