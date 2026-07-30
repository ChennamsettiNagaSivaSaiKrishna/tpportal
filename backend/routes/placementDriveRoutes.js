const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Handles student verification queue requests
router.get('/students-pending-verification', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, full_name, email, roll_number, branch, verification_status 
             FROM users 
             WHERE role = 'student'`
        );
        return res.status(200).json({
            success: true,
            students: rows || []
        });
    } catch (error) {
        console.error("Error fetching verification queue:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student verification queue",
            error: error.message
        });
    }
});

module.exports = router;