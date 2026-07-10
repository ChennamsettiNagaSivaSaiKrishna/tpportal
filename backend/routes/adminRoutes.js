const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// Test Route
router.get(
    "/test",
    verifyToken,
    verifyRole("admin"),
    adminController.test
);

// Get All Users
router.get(
    "/users",
    verifyToken,
    verifyRole("admin"),
    adminController.getAllUsers
);

module.exports = router;