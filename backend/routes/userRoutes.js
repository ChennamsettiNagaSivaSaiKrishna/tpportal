const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get(
    "/",
    verifyToken,
    userController.getUsers
);

module.exports = router;