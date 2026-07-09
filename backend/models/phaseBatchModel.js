const db = require("../config/db");

// Add Batch
exports.addBatch = async (
    phase_id,
    batch_name,
    description
) => {

    const [result] = await db.execute(
        `INSERT INTO phase_batches
        (
            phase_id,
            batch_name,
            description
        )
        VALUES (?, ?, ?)`,
        [
            phase_id,
            batch_name,
            description
        ]
    );

    return result;
};

// Get All Batches
exports.getAllBatches = async () => {

    const [rows] = await db.execute(
        `SELECT pb.*,
                tp.phase_name
         FROM phase_batches pb
         JOIN training_phases tp
           ON pb.phase_id = tp.id
         ORDER BY pb.id DESC`
    );

    return rows;
};

// Get Batch By ID
exports.getBatchById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM phase_batches
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Batch
exports.updateBatch = async (
    id,
    phase_id,
    batch_name,
    description
) => {

    const [result] = await db.execute(
        `UPDATE phase_batches
         SET
            phase_id = ?,
            batch_name = ?,
            description = ?
         WHERE id = ?`,
        [
            phase_id,
            batch_name,
            description,
            id
        ]
    );

    return result;
};

// Delete Batch
exports.deleteBatch = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM phase_batches
         WHERE id = ?`,
        [id]
    );

    return result;
};
