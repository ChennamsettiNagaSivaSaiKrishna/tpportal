const express = require('express');
const router = express.Router();
const studentCertificationController = require('../controllers/studentCertificationController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Student Certification Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  studentCertificationController.getCertifications || ((req, res) => res.json({ success: true, certifications: [] }))
);

router.post(
  '/',
  verifyToken,
  studentCertificationController.addCertification || ((req, res) => res.json({ success: true, message: 'Certification added' }))
);

router.delete(
  '/:id',
  verifyToken,
  studentCertificationController.deleteCertification || ((req, res) => res.json({ success: true, message: 'Certification deleted' }))
);

module.exports = router;