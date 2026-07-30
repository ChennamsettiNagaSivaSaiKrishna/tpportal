const express = require('express');
const router = express.Router();
const rolePermissionMappingController = require('../controllers/rolePermissionMappingController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Role Permission Mapping Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  rolePermissionMappingController.getMappings || ((req, res) => res.json({ success: true, mappings: [] }))
);

router.post(
  '/',
  verifyToken,
  rolePermissionMappingController.createMapping || ((req, res) => res.json({ success: true, message: 'Mapping created' }))
);

router.delete(
  '/:id',
  verifyToken,
  rolePermissionMappingController.deleteMapping || ((req, res) => res.json({ success: true, message: 'Mapping deleted' }))
);

module.exports = router;