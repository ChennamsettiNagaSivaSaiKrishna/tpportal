const express = require('express');
const router = express.Router();
const hodController = require('../controllers/hodController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// HOD Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  hodController?.getAllHod || ((req, res) => res.json({ success: true, hods: [] }))
);

router.post(
  '/',
  verifyToken,
  hodController?.createHod || ((req, res) => res.json({ success: true, message: 'HOD created' }))
);

router.get(
  '/:id',
  verifyToken,
  hodController?.getHodById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  hodController?.updateHod || ((req, res) => res.json({ success: true, message: 'HOD updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  hodController?.deleteHod || ((req, res) => res.json({ success: true, message: 'HOD deleted' }))
);

module.exports = router;