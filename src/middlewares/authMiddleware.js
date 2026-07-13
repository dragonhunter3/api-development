const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from format: Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_local_jwt_secret_key_123456789');

      // Attach user to req, excluding password
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, error: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, token is missing' });
  }
};

module.exports = { protect };
