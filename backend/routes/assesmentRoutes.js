const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assesmentController');

// Clean endpoints strictly forwarding request pipelines to controllers
router.get('/master-skills-inventory', assessmentController.fetchMasterCatalog);
router.post('/skills/add-node', assessmentController.linkSkillToStudent);
router.post('/start', assessmentController.startExamSession);
router.post('/submit', assessmentController.submitExamSession);

module.exports = router;