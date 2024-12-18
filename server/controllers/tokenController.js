const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email, plan_type: user.plan_type }, process.env.JWT_SECRET, { expiresIn: '15m' });
  console.log(`[INFO] Generated Access Token: ${token}`);
  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email, plan_type: user.plan_type }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  console.log(`[INFO] Generated Refresh Token: ${token}`);
  return token;
};

let storedRefreshToken = null;

const refreshToken = async (req, res) => {
  const token = req?.body?.token || storedRefreshToken;

  if (!token) {
    const errorMessage = 'Refresh token is required';
    if (res) {
      return res.status(401).json({ error: errorMessage });
    } else {
      console.error(`[ERROR] ${errorMessage}`);
      return;
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    const oneDayInSeconds = 24 * 60 * 60;

    console.log(`[INFO] Checking refresh token expiry: now=${now}, exp=${exp}, time left=${exp - now} seconds`);

    let newRefreshToken = token;
    if (exp - now < oneDayInSeconds) {
      newRefreshToken = generateRefreshToken({ id: decoded.id, email: decoded.email });
      storedRefreshToken = newRefreshToken;
      console.log(`[INFO] Refresh Token refreshed: ${newRefreshToken}`);
    }

    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

    if (res) {
      res.json({ accessToken, refreshToken: newRefreshToken });
    } else {
      console.log(`[INFO] Access Token refreshed: ${accessToken}`);
    }
  } catch (error) {
    const errorMessage = 'Invalid or expired refresh token';
    if (res) {
      res.status(403).json({ error: errorMessage });
    } else {
      console.error(`[ERROR] ${errorMessage}`);
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
};