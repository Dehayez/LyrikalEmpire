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

    // Log only when the refresh token is about to expire
    if (exp - now < oneDayInSeconds) {
      console.log(`[INFO] Refresh token is about to expire. Time left: ${exp - now} seconds`);
      const newRefreshToken = generateRefreshToken({ id: decoded.id, email: decoded.email });
      storedRefreshToken = newRefreshToken;
      console.log(`[INFO] Refresh Token refreshed`);
    }

    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    res.json({ accessToken, refreshToken: storedRefreshToken || token });
  } catch (error) {
    console.error('[ERROR] Invalid or expired refresh token');
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
};