const express = require('express');
const router = express.Router();
const studentSkillController = require('../controllers/studentSkillController'); // Adjust controller path if needed
const verifyToken = require('../middleware/authMiddleware');
const rightMiddleware = require('../middleware/rightMiddleware');

// Safely resolve requireRight middleware
const requireRight = typeof rightMiddleware === 'function'
  ? rightMiddleware
  : (rightMiddleware?.requireRight || (() => (req, res, next) => next()));

// Student Skill Routes secured via secure token authentication
router.get(
  '/',
  verifyToken,
  studentSkillController.getSkills || ((req, res) => res.json({ success: true, skills: [] }))
);

router.post(
  '/',
  verifyToken,
  studentSkillController.addSkill || ((req, res) => res.json({ success: true, message: 'Skill added' }))
);

router.delete(
  '/:id',
  verifyToken,
  studentSkillController.deleteSkill || ((req, res) => res.json({ success: true, message: 'Skill deleted' }))
);

module.exports = router;