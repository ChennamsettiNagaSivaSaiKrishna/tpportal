const express = require("express");

const router = express.Router();

const studentSkillController = require("../controllers/studentSkillController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

// Add Skill
router.post(
    "/",
    verifyToken,
    verifyRole("student"),
    studentSkillController.addSkill
);

// Get Student Skills
router.get(
    "/:student_roll",
    verifyToken,
    studentSkillController.getStudentSkills
);

// Get All Skills
router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    studentSkillController.getAllSkills
);

// Update Skill
router.put(
    "/:id",
    verifyToken,
    verifyRole("student"),
    studentSkillController.updateSkill
);

// Delete Skill
router.delete(
    "/:id",
    verifyToken,
    verifyRole("student"),
    studentSkillController.deleteSkill
);

module.exports = router;