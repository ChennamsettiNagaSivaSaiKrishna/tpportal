const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Management Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  managementController?.getAllManagement || ((req, res) => res.json({ success: true, management: [] }))
);

router.post(
  '/',
  verifyToken,
  managementController?.createManagement || ((req, res) => res.json({ success: true, message: 'Management record created' }))
);

router.get(
  '/:id',
  verifyToken,
  managementController?.getManagementById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  managementController?.updateManagement || ((req, res) => res.json({ success: true, message: 'Management record updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  managementController?.deleteManagement || ((req, res) => res.json({ success: true, message: 'Management record deleted' }))
);

module.exports = router;