const jwt = require('jsonwebtoken');

const checkPlan = (requiredPlan) => {
  return (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error(`[ERROR] Token verification failed: ${error.message}`);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.plan_type !== requiredPlan) {
      console.warn(`[WARN] Access denied for user ID: ${decoded.id}. Required plan: ${requiredPlan}, User plan: ${decoded.plan_type}`);
      return res.status(403).json({ error: 'Access denied. Upgrade your plan to access this resource.' });
    }

    next();
  };
};

module.exports = checkPlan;