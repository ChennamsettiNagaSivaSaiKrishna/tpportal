const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Support Bearer token from headers, cookies, or body
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
    || req.cookies?.token
    || req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No authentication token provided.' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'tp_portal_super_secret_key_2026';
    const verified = jwt.verify(token, secret);
    req.user = verified; // { id, email, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired authentication session token.' 
    });
  }
};

// Export both default function and named object property for universal compatibility
verifyToken.verifyToken = verifyToken;
module.exports = verifyToken;