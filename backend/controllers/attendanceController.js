const db = require('../config/db');
const attendanceModel = require("../models/attendanceModel");

// 1. Get All Active/Upcoming Training Phases
exports.getAllPhases = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, phase_name FROM training_phases WHERE status = "active" OR status = "upcoming"');
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error("Error inside getAllPhases:", err);
        return res.status(500).json({ success: false, message: "Database failure reading tracking phases." });
    }
};

// 2. Get Batches Associated With Selected Phase
exports.getBatchesByPhase = async (req, res) => {
    try {
        const { phaseId } = req.params;
        const [rows] = await db.execute('SELECT id, batch_name FROM phase_batches WHERE phase_id = ?', [phaseId]);
        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error("Error inside getBatchesByPhase:", err);
        return res.status(500).json({ success: false, message: "Database failure reading target batch arrays." });
    }
};

// 3. Get Full Sheet Roster
exports.getAttendanceSheet = async (req, res) => {
    try {
        const { batch_id, date, slot } = req.query;
        if (!batch_id || !date || !slot) {
            return res.status(400).json({ success: false, message: "Missing required query parameters." });
        }
        const sessionMeta = await attendanceModel.getOrCreateSession(batch_id, date, slot);
        const students = await attendanceModel.getSheetRecords(sessionMeta.id, batch_id);

        res.status(200).json({
            success: true,
            session_id: sessionMeta.id,
            session_locked: !!sessionMeta.attendance_locked,
            students: students
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error loading attendance grid matrix." });
    }
};

// 4. Save Grid Roster Sheet
exports.saveAttendanceGrid = async (req, res) => {
    try {
        const { session_id, attendance_records } = req.body;
        const marked_by_user_id = req.user?.id || null;

        if (!session_id || !Array.isArray(attendance_records)) {
            return res.status(400).json({ success: false, message: "Invalid payload footprint." });
        }

        const isLocked = await attendanceModel.checkSessionLockState(session_id);
        if (isLocked) {
            return res.status(403).json({ success: false, message: "Operation Aborted: Sheet is locked." });
        }

        await attendanceModel.saveBulkRecords(session_id, attendance_records, marked_by_user_id);
        res.status(200).json({ success: true, message: "Attendance sheet synchronized successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error saving tracking sheets." });
    }
};

// =============================================================================
// 🚀 5. ADDED: Get Individual Student Attendance History
// =============================================================================
exports.getStudentAttendanceHistory = async (req, res) => {
    try {
        // Collect parameter robustly from URL params or query strings
        const rollNumber = req.params.rollNumber || req.query.rollNumber || req.query.student_roll;

        if (!rollNumber) {
            return res.status(400).json({ success: false, message: "Roll number parameter is required." });
        }

        // Fetch matched ledger data joining session specifics
        const query = `
            SELECT 
                att.id,
                ts.session_date,
                ts.session_slot,
                ts.topic,
                att.attendance_status
            FROM attendance att
            INNER JOIN training_sessions ts ON att.session_id = ts.id
            WHERE att.student_roll = ?
            ORDER BY ts.session_date DESC, ts.session_slot ASC
        `;

        const [history] = await db.execute(query, [rollNumber.trim()]);

        return res.status(200).json({
            success: true,
            history: history
        });
    } catch (err) {
        console.error("History lookup crash inside getStudentAttendanceHistory:", err);
        return res.status(500).json({ success: false, message: "Server tracking transaction lookup error." });
    }
};