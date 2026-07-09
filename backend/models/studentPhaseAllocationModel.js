const db = require("../config/db");

// Add Allocation
exports.addAllocation = async (
    student_roll,
    batch_id
) => {

    const [result] = await db.execute(
        `INSERT INTO student_phase_allocations
        (
            student_roll,
            batch_id
        )
        VALUES (?, ?)`,
        [
            student_roll,
            batch_id
        ]
    );

    return result;
};

// Get All Allocations
exports.getAllAllocations = async () => {

    const [rows] = await db.execute(
        `SELECT spa.*,
                sp.full_name,
                pb.batch_name,
                tp.phase_name
         FROM student_phase_allocations spa
         JOIN student_profiles sp
            ON spa.student_roll = sp.roll_number
         JOIN phase_batches pb
            ON spa.batch_id = pb.id
         JOIN training_phases tp
            ON pb.phase_id = tp.id
         ORDER BY spa.id DESC`
    );

    return rows;
};

// Get Allocation By ID
exports.getAllocationById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM student_phase_allocations
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Allocation
exports.updateAllocation = async (
    id,
    student_roll,
    batch_id
) => {

    const [result] = await db.execute(
        `UPDATE student_phase_allocations
         SET
            student_roll = ?,
            batch_id = ?
         WHERE id = ?`,
        [
            student_roll,
            batch_id,
            id
        ]
    );

    return result;
};

// Delete Allocation
exports.deleteAllocation = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM student_phase_allocations
         WHERE id = ?`,
        [id]
    );

    return result;
};