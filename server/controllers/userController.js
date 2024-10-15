const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../config/emailConfig');
const { handleQuery } = require('../helpers/dbHelpers');
const db = require('../config/db'); // Import the database connection

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ username, email, password: hashedPassword }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Generated token:', token); // Log the generated token

    const url = `http://localhost:3000/confirm/${token}`;
    await transporter.sendMail({
      from: '"Lyrikal Empire" <info@lyrikalempire.com>',
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`,
    });

    res.status(200).json({ message: 'Registration successful. Please check your email to confirm your account.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, email, password } = decoded;

    const existingUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const existingUserParams = [username, email];
    const [existingUser] = await db.query(existingUserQuery, existingUserParams);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    await handleQuery(
      'INSERT INTO users (username, email, password, confirmed) VALUES (?, ?, ?, ?)',
      [username, email, password, true],
      res,
      'Email confirmed successfully'
    );
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

const login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  const query = identifier.includes('@') ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';

  handleQuery(query, [identifier], res, null, true, async (user) => {
    if (!user) {
      return res.status(400).json({ error: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email/username or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};

module.exports = {
  register,
  confirmEmail,
  login
};