const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = auth;