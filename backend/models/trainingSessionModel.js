const db = require("../config/db");

// ======================================
// Add Training Session
// ======================================
exports.addSession = async (
    batch_id,
    session_date,
    slot,
    trainer_name,
    trainer_subject
) => {

    const [result] = await db.execute(
        `INSERT INTO training_sessions
        (
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        ]
    );

    return result;
};

// ======================================
// Get All Sessions
// ======================================
exports.getAllSessions = async () => {

    const [rows] = await db.execute(
        `SELECT
            ts.*,
            pb.batch_name
        FROM training_sessions ts
        JOIN phase_batches pb
            ON ts.batch_id = pb.id
        ORDER BY ts.session_date DESC`
    );

    return rows;
};

// ======================================
// Get Session By ID
// ======================================
exports.getSessionById = async (id) => {

    const [rows] = await db.execute(
        `SELECT
            ts.*,
            pb.batch_name
        FROM training_sessions ts
        JOIN phase_batches pb
            ON ts.batch_id = pb.id
        WHERE ts.id = ?`,
        [id]
    );

    return rows;
};

// ======================================
// Update Session
// ======================================
exports.updateSession = async (
    id,
    batch_id,
    session_date,
    slot,
    trainer_name,
    trainer_subject
) => {

    const [result] = await db.execute(
        `UPDATE training_sessions
        SET
            batch_id = ?,
            session_date = ?,
            slot = ?,
            trainer_name = ?,
            trainer_subject = ?
        WHERE id = ?`,
        [
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject,
            id
        ]
    );

    return result;
};

// ======================================
// Delete Session
// ======================================
exports.deleteSession = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM training_sessions
        WHERE id = ?`,
        [id]
    );

    return result;
};