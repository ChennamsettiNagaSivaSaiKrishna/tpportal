const express = require('express');
const router = express.Router();
// Import your database connection pool/instance correctly here (adjust path if needed)
const db = require('../config/db'); 

// 1. Get User Rights / Permissions Endpoint
router.get('/rights', async (req, res) => {
    try {
        // Fallback check if user role exists on session or request
        const userRole = req.user?.role || 'student';

        const [rows] = await db.query(
            `SELECT permission_key FROM role_permissions WHERE role = ?`, 
            [userRole]
        );

        let allowedRights = rows.map(row => row.permission_key);

        // Emergency fallback array so features load properly if DB table is unseeded
        if (allowedRights.length === 0) {
            allowedRights = [
                'NAV_METRICS', 'NAV_PLACEMENTS', 'NAV_DRIVES', 
                'NAV_SKILLS', 'NAV_CALENDAR', 'NAV_RESUME', 
                'NAV_ATTENDANCE_HISTORY', 'NAV_NOTIFICATIONS', 
                'NAV_PROFILE', 'NAV_STUDENT_VERIFY'
            ];
        }

        return res.status(200).json({
            success: true,
            role: userRole,
            rights: allowedRights
        });
    } catch (error) {
        console.error("Error fetching dynamic rights matrix:", error);
        return res.status(500).json({ 
            success: false, 
            rights: [
                'NAV_METRICS', 'NAV_PLACEMENTS', 'NAV_DRIVES', 
                'NAV_SKILLS', 'NAV_CALENDAR', 'NAV_RESUME', 
                'NAV_ATTENDANCE_HISTORY', 'NAV_NOTIFICATIONS', 
                'NAV_PROFILE', 'NAV_STUDENT_VERIFY'
            ] 
        });
    }
});

// 2. Get Student Profile Endpoint
router.get('/profile', async (req, res) => {
    try {
        // Add your profile query logic here matching your backend schema
        return res.status(200).json({
            success: true,
            profile: {
                fullName: "Verified Student",
                rollNumber: "26POLY01",
                branch: "Computer Science",
                cgpa: 8.5,
                verificationStatus: "Approved"
            }
        });
    } catch (err) {
        console.error("Profile fetch error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// 3. Get Departments List Endpoint
router.get('/departments-list', async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            departments: [
                { id: 1, dept_name: "CSE", dept_full_name: "Computer Science and Engineering" },
                { id: 2, dept_name: "ECE", dept_full_name: "Electronics and Communication Engineering" }
            ]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;