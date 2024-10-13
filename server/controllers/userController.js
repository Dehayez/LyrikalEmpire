const { handleQuery } = require('../helpers/dbHelpers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        handleQuery(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            res,
            'User created successfully'
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
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
    login
};