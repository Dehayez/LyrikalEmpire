const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email, plan_type: user.plan_type }, process.env.JWT_SECRET, { expiresIn: '15m' });
  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email, plan_type: user.plan_type }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return token;
};

let storedRefreshToken = null;

const refreshToken = async (req, res) => {
  const token = req?.body?.token || storedRefreshToken;

  if (!token) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    const oneDayInSeconds = 24 * 60 * 60;

    if (exp - now < oneDayInSeconds) {
      const newRefreshToken = generateRefreshToken({ id: decoded.id, email: decoded.email, plan_type: decoded.plan_type });
      storedRefreshToken = newRefreshToken;
    }

    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email, plan_type: decoded.plan_type });
    res.json({ accessToken, refreshToken: storedRefreshToken || token });
  } catch (error) {
    console.error('[ERROR] Invalid or expired refresh token', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
};