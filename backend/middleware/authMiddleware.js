const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Read token from secure HTTP-only cookie instead of localStorage/headers
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No session token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attaches { id, email } to request pipeline
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

module.exports = verifyToken;