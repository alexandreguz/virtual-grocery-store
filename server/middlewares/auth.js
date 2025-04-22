const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]?.replace(/"/g, '') || null;
  if (!token) return res.status(403).json({ message: 'Token not provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token', error: err.message });
    req.user = decoded;
    next();
  });
};

const adminMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = { authMiddleware, adminMiddleware };