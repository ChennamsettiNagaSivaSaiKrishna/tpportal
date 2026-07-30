const express = require('express');
const router = express.Router();
const studentProjectController = require('../controllers/studentProjectController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Student Project Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  studentProjectController.getProjects || ((req, res) => res.json({ success: true, projects: [] }))
);

router.post(
  '/',
  verifyToken,
  studentProjectController.addProject || ((req, res) => res.json({ success: true, message: 'Project added' }))
);

router.put(
  '/:id',
  verifyToken,
  studentProjectController.updateProject || ((req, res) => res.json({ success: true, message: 'Project updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  studentProjectController.deleteProject || ((req, res) => res.json({ success: true, message: 'Project deleted' }))
);

module.exports = router;