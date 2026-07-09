const db = require("../config/db");

// Add Training Phase
exports.addPhase = async (
    phase_name,
    academic_year,
    is_active
) => {

    const [result] = await db.execute(
        `INSERT INTO training_phases
        (
            phase_name,
            academic_year,
            is_active
        )
        VALUES (?, ?, ?)`,
        [
            phase_name,
            academic_year,
            is_active
        ]
    );

    return result;
};

// Get All Phases
exports.getAllPhases = async () => {

    const [rows] = await db.execute(
        `SELECT *
         FROM training_phases
         ORDER BY id DESC`
    );

    return rows;
};

// Get Phase By ID
exports.getPhaseById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM training_phases
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Phase
exports.updatePhase = async (
    id,
    phase_name,
    academic_year,
    is_active
) => {

    const [result] = await db.execute(
        `UPDATE training_phases
         SET
            phase_name = ?,
            academic_year = ?,
            is_active = ?
         WHERE id = ?`,
        [
            phase_name,
            academic_year,
            is_active,
            id
        ]
    );

    return result;
};

// Delete Phase
exports.deletePhase = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM training_phases
         WHERE id = ?`,
        [id]
    );

    return result;
};