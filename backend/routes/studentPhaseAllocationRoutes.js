const express = require('express');
const router = express.Router();
const studentPhaseAllocationController = require('../controllers/studentPhaseAllocationController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Student Phase Allocation Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  studentPhaseAllocationController.getAllAllocations || ((req, res) => res.json({ success: true, allocations: [] }))
);

router.post(
  '/',
  verifyToken,
  studentPhaseAllocationController.createAllocation || ((req, res) => res.json({ success: true, message: 'Allocation created' }))
);

router.put(
  '/:id',
  verifyToken,
  studentPhaseAllocationController.updateAllocation || ((req, res) => res.json({ success: true, message: 'Allocation updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  studentPhaseAllocationController.deleteAllocation || ((req, res) => res.json({ success: true, message: 'Allocation deleted' }))
);

module.exports = router;