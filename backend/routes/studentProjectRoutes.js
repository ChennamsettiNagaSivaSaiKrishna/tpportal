const express = require("express");

const router = express.Router();

const controller = require("../controllers/studentProjectController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole("student"),
    controller.addProject
);

router.get(
    "/:student_roll",
    verifyToken,
    controller.getStudentProjects
);

router.get(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    controller.getAllProjects
);

router.put(
    "/:id",
    verifyToken,
    verifyRole("student"),
    controller.updateProject
);

router.delete(
    "/:id",
    verifyToken,
    verifyRole("student"),
    controller.deleteProject
);

module.exports = router;