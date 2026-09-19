const db = require("../config/db");

// Add Training Session
exports.addSession = async (batch_id, session_date, slot = 'Morning_S1', trainer_name = '', topic = '', marked_by = null) => {
    const [result] = await db.query(
        `INSERT INTO training_sessions
        (batch_id, session_date, session_slot, trainer_name, topic, attendance_locked, marked_by)
        VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [batch_id, session_date, slot, trainer_name, topic, marked_by]
    );
    return result;
};

// Get All Sessions with Batch and Phase Names
exports.getAllSessions = async () => {
    const [rows] = await db.query(
        `SELECT
            ts.id,
            ts.batch_id,
            ts.session_date,
            ts.session_slot,
            ts.session_slot AS slot,
            ts.trainer_name,
            ts.topic,
            ts.topic AS trainer_subject,
            ts.attendance_locked,
            ts.marked_by,
            ts.created_at,
            pb.batch_name,
            tp.phase_name,
            tp.id AS phase_id,
            COUNT(att.id) AS attendance_marked_count
        FROM training_sessions ts
        JOIN phase_batches pb ON ts.batch_id = pb.id
        JOIN training_phases tp ON pb.phase_id = tp.id
        LEFT JOIN attendance att ON ts.id = att.session_id
        GROUP BY ts.id
        ORDER BY ts.session_date DESC, ts.id DESC`
    );
    return rows;
};

// Get Sessions by Batch ID
exports.getSessionsByBatch = async (batch_id) => {
    const [rows] = await db.query(
        `SELECT
            ts.id,
            ts.batch_id,
            ts.session_date,
            ts.session_slot,
            ts.session_slot AS slot,
            ts.trainer_name,
            ts.topic,
            ts.topic AS trainer_subject,
            ts.attendance_locked,
            ts.marked_by,
            ts.created_at,
            pb.batch_name,
            COUNT(att.id) AS attendance_marked_count
        FROM training_sessions ts
        JOIN phase_batches pb ON ts.batch_id = pb.id
        LEFT JOIN attendance att ON ts.id = att.session_id
        WHERE ts.batch_id = ?
        GROUP BY ts.id
        ORDER BY ts.session_date DESC, ts.id DESC`,
        [batch_id]
    );
    return rows;
};

// Get Session By ID with full context
exports.getSessionById = async (id) => {
    const [rows] = await db.query(
        `SELECT
            ts.id,
            ts.batch_id,
            ts.session_date,
            ts.session_slot,
            ts.session_slot AS slot,
            ts.trainer_name,
            ts.topic,
            ts.topic AS trainer_subject,
            ts.attendance_locked,
            ts.marked_by,
            ts.created_at,
            pb.batch_name,
            pb.phase_id,
            tp.phase_name
        FROM training_sessions ts
        JOIN phase_batches pb ON ts.batch_id = pb.id
        JOIN training_phases tp ON pb.phase_id = tp.id
        WHERE ts.id = ?`,
        [id]
    );
    return rows[0] || null;
};

// Update Session
exports.updateSession = async (id, batch_id, session_date, slot, trainer_name, topic, attendance_locked) => {
    const [result] = await db.query(
        `UPDATE training_sessions
        SET
            batch_id = COALESCE(?, batch_id),
            session_date = COALESCE(?, session_date),
            session_slot = COALESCE(?, session_slot),
            trainer_name = COALESCE(?, trainer_name),
            topic = COALESCE(?, topic),
            attendance_locked = COALESCE(?, attendance_locked)
        WHERE id = ?`,
        [batch_id, session_date, slot, trainer_name, topic, attendance_locked, id]
    );
    return result;
};

// Delete Session
exports.deleteSession = async (id) => {
    const [result] = await db.query(
        `DELETE FROM training_sessions WHERE id = ?`,
        [id]
    );
    return result;
};