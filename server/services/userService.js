const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const findOrCreateUser = async (profile) => {
  const { id, displayName, emails } = profile;
  const email = emails[0].value;

  let user = await db.query('SELECT * FROM users WHERE google_id = ?', [id]);

  if (user.length === 0) {
    const newUser = {
      google_id: id,
      username: displayName,
      email: email,
      password: await bcrypt.hash('default_password', 10),
    };

    const result = await db.query('INSERT INTO users SET ?', newUser);
    newUser.id = result.insertId;
    user = newUser;
  } else {
    user = user[0];
  }

  return user;
};

const findUserById = async (id) => {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user[0];
};

module.exports = {
  findOrCreateUser,
  findUserById,
};