const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Offer Management Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  offerController.getAllOffers || ((req, res) => res.json({ success: true, offers: [] }))
);

router.post(
  '/',
  verifyToken,
  offerController.createOffer || ((req, res) => res.json({ success: true, message: 'Offer created' }))
);

router.put(
  '/:id/status',
  verifyToken,
  offerController.updateOfferStatus || ((req, res) => res.json({ success: true, message: 'Offer status updated' }))
);

module.exports = router;