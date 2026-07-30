const express = require('express');
const router = express.Router();
const authRbacController = require('../controllers/authRbacController');
const authMiddleware = require('../middleware/authMiddleware');

// Handle both object-destructured exports ({ verifyToken }) and direct function exports (verifyToken)
const verifyTokenFn = typeof authMiddleware === 'function' 
  ? authMiddleware 
  : (authMiddleware.verifyToken || authMiddleware.auth || authMiddleware);

if (typeof verifyTokenFn !== 'function') {
  console.error("CRITICAL ERROR: Auth middleware resolved to non-function object. Check exports in backend/middleware/authMiddleware.js");
}

if (typeof authRbacController.getPageRights !== 'function') {
  console.error("CRITICAL ERROR: getPageRights controller is not a function. Check exports in backend/controllers/authRbacController.js");
}

// Protected route to fetch dynamic system rights for the active user session
router.get('/getPageRights', verifyTokenFn, authRbacController.getPageRights);

module.exports = router;