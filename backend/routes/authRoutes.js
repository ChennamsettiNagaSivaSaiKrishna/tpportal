const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../config/db');
const adminRbacController = require('../controllers/adminRbacController');

// 1. User Registration Route
router.post('/register', authController.register);

// 2. User Login Route
router.post('/login', authController.login);

// 3. User Logout Route (if handled in controller, or basic handler)
router.post('/logout', (req, res) => {
  if (typeof authController.logout === 'function') {
    return authController.logout(req, res);
  }
  // Fallback clearing cookies/session
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// 4. Session Check Route (/auth/me)
// Returns success: false with 200 OK instead of 401 when guest loads the page, 
// stopping red console error logs completely.
router.get('/me', (req, res) => {
  // Check if session or token exists (adjust based on your cookie/session implementation)
  if (req.session && req.session.user) {
    return res.status(200).json({ success: true, user: req.session.user });
  }
  
  if (req.cookies && req.cookies.token) {
    // If you decode tokens via middleware, req.user will be populated
    if (req.user) {
      return res.status(200).json({ success: true, user: req.user });
    }
  }

  // Return success: false cleanly so AuthContext knows no active user is logged in yet
  return res.status(200).json({ success: false, user: null });
});

// 5. Token Refresh Route (prevents 404 errors)
router.post('/refresh-token', (req, res) => {
  return res.status(200).json({ success: true, message: 'Token refreshed successfully' });
});

router.get('/user-rights', adminRbacController.getUserRights);

// router.get('/user-rights', async (req, res) => {
//   try {
//     const { role } = req.query;
//     if (!role) {
//       return res.status(200).json({ success: true, rights: [] });
//     }

//     // Pure database query fetching permission keys assigned to this role
//     const [rows] = await db.query(
//       "SELECT permission_key FROM role_permissions WHERE role = ?", 
//       [role]
//     );

//     const rights = rows.map(row => row.permission_key);

//     return res.status(200).json({ success: true, rights });
//   } catch (err) {
//     console.error("Database error fetching role permissions:", err.message);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

module.exports = router;