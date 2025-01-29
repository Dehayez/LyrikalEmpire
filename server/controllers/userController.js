const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig');
const { handleQuery } = require('../helpers/dbHelpers');
const db = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('./tokenController');

const resendAttempts = {};

const verifyToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address. Please provide a valid email.' });
  }

  try {
    const existingUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const existingUserParams = [username, email];
    const [existingUser] = await db.query(existingUserQuery, existingUserParams);

    if (existingUser.length > 0) {
      const existingUsernames = existingUser.filter(user => user.username === username);
      const existingEmails = existingUser.filter(user => user.email === email);

      if (existingEmails.length > 0 && existingUsernames.length > 0) {
        return res.status(400).json({ error: 'Email and Username are already in use' });
      } else if (existingEmails.length > 0) {
        return res.status(400).json({ error: 'Email is already in use' });
      } else if (existingUsernames.length > 0) {
        return res.status(400).json({ error: 'Username is already in use' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ username, email, password: hashedPassword }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const url = `http://localhost:3000/confirm/${token}`;
    await transporter.sendMail({
      from: '"Lyrikal Empire" <info@lyrikalempire.com>',
      to: email,
      subject: 'Confirm your email',
      html: `
        <div>
          <p>Hi ${username},</p>
          <p>Please click <a href="${url}">here</a> to confirm your email address.</p>
          <p>Or use the following link:</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you did not register for an account, please ignore this email.</p>
          <p>Kind regards,<br>Lyrikal Empire</p>
        </div>
      `,
    });

    resendAttempts[email] = { lastResend: new Date() };

    res.status(200).json({ message: 'Registration successful. Please check your email to confirm your account.' });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Database is not reachable. Please try again later.' });
    }
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

    delete resendAttempts[email];
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

const resendConfirmationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const now = new Date();
    const bufferPeriod = 9 * 1000;

    if (resendAttempts[email] && now - new Date(resendAttempts[email].lastResend) < bufferPeriod) {
      const waitTime = Math.ceil((bufferPeriod - (now - new Date(resendAttempts[email].lastResend))) / 1000);
      return res.status(429).json({ error: `Please wait ${waitTime} seconds before resending the confirmation email.`, waitTime });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const url = `http://localhost:3000/confirm/${token}`;
    await transporter.sendMail({
      from: '"Lyrikal Empire" <info@lyrikalempire.com>',
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`,
    });

    resendAttempts[email] = { lastResend: now };

    res.status(200).json({ message: 'Confirmation email resent. Please check your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

try {
    const [user] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const accessToken = generateAccessToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);

    res.json({ accessToken, refreshToken, email: user[0].email, username: user[0].username, id: user[0].id });
  } catch (error) {
    console.error('Error during login process:', error);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Database is not reachable. Please try again later.' });
    }

    res.status(500).json({ error: 'Internal server error', message: error.message, stack: error.stack });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const url = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      from: '"Lyrikal Empire" <info@lyrikalempire.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <div>
          <p>Hi ${user[0].username},</p>
          <p>We received a request to reset your password. Please click <a href="${url}">here</a> to reset your password.</p>
          <p>Or use the following link:</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Kind regards,<br>Lyrikal Empire</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset email sent. Please check your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    const hashedPassword = await bcrypt.hash(password, 10);

    await handleQuery(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email],
      res,
      'Password reset successfully'
    );
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ email: user[0].email, username: user[0].username, id: user[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { username } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await handleQuery(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId],
      res,
      'User details updated successfully'
    );
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  confirmEmail,
  resendConfirmationEmail,
  login,
  requestPasswordReset,
  resetPassword,
  verifyToken,
  getUserDetails,
  updateUserDetails,
};