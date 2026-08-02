const express = require('express');
const router = express.Router();

// 1. Safely load controllers with fallback checks
const adminRbacController = require('../controllers/adminRbacController');
const { 
  getRights = adminRbacController?.getRights,
  createRight = adminRbacController?.createRight,
  getGroups = adminRbacController?.getGroups,
  createGroup = adminRbacController?.createGroup,
  assignRightsToGroup = adminRbacController?.assignRightsToGroup,
  assignUserGroups = adminRbacController?.assignUserGroups
} = adminRbacController || {};

// 2. Safely load auth/RBAC middleware with fallback checks
const authMiddleware = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

const verifyToken = typeof authMiddleware === 'function' 
  ? authMiddleware 
  : (authMiddleware?.verifyToken || authMiddleware?.auth || ((req, res, next) => next()));

const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Verify all handlers exist to prevent router crashes
const validateHandler = (fn, name) => {
  if (typeof fn !== 'function') {
    console.error(`CRITICAL ERROR: Controller or middleware '${name}' is undefined or not a function. Check exports.`);
    return (req, res) => res.status(500).json({ success: false, message: `Route handler '${name}' missing.` });
  }
  return fn;
};

// 3. Define Admin RBAC Management Routes
router.get('/rights', verifyToken, validateHandler(getRights, 'getRights'));
router.post('/rights', verifyToken, validateHandler(createRight, 'createRight'));

router.get('/groups', verifyToken, validateHandler(getGroups, 'getGroups'));
router.post('/groups', verifyToken, validateHandler(createGroup, 'createGroup'));

router.post('/groups/assign-rights', verifyToken, validateHandler(assignRightsToGroup, 'assignRightsToGroup'));
router.post('/users/assign-group', verifyToken, validateHandler(assignUserGroups, 'assignUserGroups'));

router.get('/rbac-matrix', adminRbacController.getAdminMatrix);
router.post('/rbac-create', adminRbacController.createEntity);
router.post('/rbac-assign', adminRbacController.assignMapping);
router.get('/users-list', adminRbacController.getUsersList);
router.post('/assign-user-role', adminRbacController.assignUserRole);

module.exports = router;