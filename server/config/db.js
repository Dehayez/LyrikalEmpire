const mysql = require('mysql2/promise');
require('dotenv').config();
const user = process.env.DB_USER;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: user,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

module.exports = db;