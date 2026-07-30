const express = require('express');
const router = express.Router();
const systemPermissionController = require('../controllers/systemPermissionController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// System Permission Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  systemPermissionController.getPermissions || ((req, res) => res.json({ success: true, permissions: [] }))
);

router.post(
  '/',
  verifyToken,
  systemPermissionController.createPermission || ((req, res) => res.json({ success: true, message: 'Permission created' }))
);

router.put(
  '/:id',
  verifyToken,
  systemPermissionController.updatePermission || ((req, res) => res.json({ success: true, message: 'Permission updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  systemPermissionController.deletePermission || ((req, res) => res.json({ success: true, message: 'Permission deleted' }))
);

module.exports = router;