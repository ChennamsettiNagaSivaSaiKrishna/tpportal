const db = require("../config/db");

// Add Training Phase
exports.addPhase = async (phase_name, academic_year, description = '', is_active = 1, start_date = null, end_date = null, status = 'active') => {
    const [result] = await db.query(
        `INSERT INTO training_phases
        (phase_name, academic_year, description, is_active, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [phase_name, academic_year || '2025-2026', description, is_active ? 1 : 0, start_date, end_date, status]
    );
    return result;
};

// Get All Phases with aggregated statistics
exports.getAllPhases = async () => {
    const query = `
        SELECT 
            tp.*,
            COUNT(DISTINCT pb.id) AS total_batches,
            COUNT(DISTINCT spa.student_roll) AS total_students,
            COUNT(DISTINCT ts.id) AS total_sessions
        FROM training_phases tp
        LEFT JOIN phase_batches pb ON tp.id = pb.phase_id
        LEFT JOIN student_phase_allocations spa ON pb.id = spa.batch_id
        LEFT JOIN training_sessions ts ON pb.id = ts.batch_id
        GROUP BY tp.id
        ORDER BY tp.id DESC
    `;
    const [rows] = await db.query(query);
    return rows;
};

// Get Phase By ID with comprehensive details
exports.getPhaseById = async (id) => {
    const phaseQuery = `
        SELECT 
            tp.*,
            COUNT(DISTINCT pb.id) AS total_batches,
            COUNT(DISTINCT spa.student_roll) AS total_students,
            COUNT(DISTINCT ts.id) AS total_sessions
        FROM training_phases tp
        LEFT JOIN phase_batches pb ON tp.id = pb.phase_id
        LEFT JOIN student_phase_allocations spa ON pb.id = spa.batch_id
        LEFT JOIN training_sessions ts ON pb.id = ts.batch_id
        WHERE tp.id = ?
        GROUP BY tp.id
    `;
    const [rows] = await db.query(phaseQuery, [id]);
    if (rows.length === 0) return null;

    const phase = rows[0];

    // Also fetch associated batches with student counts
    const [batches] = await db.query(`
        SELECT 
            pb.*,
            COUNT(spa.id) AS student_count
        FROM phase_batches pb
        LEFT JOIN student_phase_allocations spa ON pb.id = spa.batch_id
        WHERE pb.phase_id = ?
        GROUP BY pb.id
        ORDER BY pb.id ASC
    `, [id]);

    phase.batches = batches;
    return phase;
};

// Update Phase
exports.updatePhase = async (id, phase_name, academic_year, description, is_active, start_date, end_date, status) => {
    const [result] = await db.query(
        `UPDATE training_phases
         SET
            phase_name = COALESCE(?, phase_name),
            academic_year = COALESCE(?, academic_year),
            description = COALESCE(?, description),
            is_active = COALESCE(?, is_active),
            start_date = COALESCE(?, start_date),
            end_date = COALESCE(?, end_date),
            status = COALESCE(?, status)
         WHERE id = ?`,
        [phase_name, academic_year, description, is_active !== undefined ? (is_active ? 1 : 0) : null, start_date, end_date, status, id]
    );
    return result;
};

// Delete Phase
exports.deletePhase = async (id) => {
    const [result] = await db.query(
        `DELETE FROM training_phases WHERE id = ?`,
        [id]
    );
    return result;
};