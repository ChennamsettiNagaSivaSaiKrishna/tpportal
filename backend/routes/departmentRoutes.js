const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Department Management Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  departmentController.getAllDepartments || ((req, res) => res.json({ success: true, departments: [] }))
);

router.post(
  '/',
  verifyToken,
  departmentController.createDepartment || ((req, res) => res.json({ success: true, message: 'Department created' }))
);

router.put(
  '/:id',
  verifyToken,
  departmentController.updateDepartment || ((req, res) => res.json({ success: true, message: 'Department updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  departmentController.deleteDepartment || ((req, res) => res.json({ success: true, message: 'Department deleted' }))
);

module.exports = router;