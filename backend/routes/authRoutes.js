const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require('../middleware/authMiddleware');

// Test
router.get("/test", authController.test);

// RegisterStudent
router.post("/register/student", authController.register);

// Login
router.post("/login", authController.login);
router.get('/me', verifyToken, authController.me);

router.post("/logout", (req, res) => {
    // Clear cookie if you are using HTTP-Only cookies
    res.clearCookie("token"); 
    
    return res.status(200).json({
        success: true,
        message: "Logged out successfully from session context."
    });
});

module.exports = router;