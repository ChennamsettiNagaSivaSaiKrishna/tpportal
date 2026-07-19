const db = require('../config/db');

// GET /api/placement/students-pending-verification
exports.getPendingStudents = async (req, res) => {
    try {
        const query = `
            SELECT sp.user_id, sp.full_name, sp.roll_number, sp.section, sp.verification_status, d.dept_name, u.email
            FROM student_profiles sp
            INNER JOIN users u ON sp.user_id = u.id
            LEFT JOIN departments d ON sp.department_id = d.id
            WHERE sp.verification_status = 'Pending'
            ORDER BY sp.roll_number ASC
        `;
        const [rows] = await db.execute(query);
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error loading structural maps." });
    }
};

// POST /api/placement/update-verification-status
exports.updateVerificationStatus = async (req, res) => {
    try {
        const { target_roll, target_status, notes } = req.body;
        const verifierId = req.user ? req.user.id : 'COORDINATOR';

        await db.execute(
            `UPDATE student_profiles 
             SET verification_status = ?, verified_by = ?, verification_notes = ? 
             WHERE roll_number = ?`,
            [target_status, verifierId, notes || '', target_roll]
        );
        return res.status(200).json({ success: true, message: "Verification status synchronized completely." });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to update profile verification state." });
    }
};