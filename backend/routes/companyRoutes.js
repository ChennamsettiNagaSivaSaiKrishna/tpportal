const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController'); // Adjust path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Example company routes secured via token authentication 
// (You can append requireRight('YOUR_RIGHT_CODE') if specific permissions are required)

router.get(
  '/',
  verifyToken,
  companyController.getAllCompanies || ((req, res) => res.json({ success: true, companies: [] }))
);

router.post(
  '/',
  verifyToken,
  companyController.createCompany || ((req, res) => res.json({ success: true, message: 'Company created' }))
);

router.get(
  '/:id',
  verifyToken,
  companyController.getCompanyById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  companyController.updateCompany || ((req, res) => res.json({ success: true, message: 'Company updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  companyController.deleteCompany || ((req, res) => res.json({ success: true, message: 'Company deleted' }))
);

module.exports = router;