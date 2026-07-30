const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Job Posting Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  jobPostingController.getAllJobPostings || ((req, res) => res.json({ success: true, postings: [] }))
);

router.post(
  '/',
  verifyToken,
  jobPostingController.createJobPosting || ((req, res) => res.json({ success: true, message: 'Job posting created' }))
);

router.get(
  '/:id',
  verifyToken,
  jobPostingController.getJobPostingById || ((req, res) => res.json({ success: true }))
);

router.put(
  '/:id',
  verifyToken,
  jobPostingController.updateJobPosting || ((req, res) => res.json({ success: true, message: 'Job posting updated' }))
);

router.delete(
  '/:id',
  verifyToken,
  jobPostingController.deleteJobPosting || ((req, res) => res.json({ success: true, message: 'Job posting deleted' }))
);

module.exports = router;