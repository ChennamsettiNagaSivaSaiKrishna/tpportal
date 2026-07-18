const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const userNotificationController = require("../controllers/userNotificationController");
const userController = require("../controllers/userController");

router.get(
    "/users",
    verifyToken,
    userNotificationController.getUsers
);

module.exports = router;