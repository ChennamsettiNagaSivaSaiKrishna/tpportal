const db = require("../config/db");

// Add Allocation for a Single Student
exports.addAllocation = async (student_roll, batch_id) => {
    const [result] = await db.query(
        `INSERT INTO student_phase_allocations (student_roll, batch_id)
         VALUES (?, ?)`,
        [student_roll.trim(), batch_id]
    );
    return result;
};

// Check if student is already allocated to this batch
exports.findAllocation = async (student_roll, batch_id) => {
    const [rows] = await db.query(
        `SELECT * FROM student_phase_allocations
         WHERE student_roll = ? AND batch_id = ?`,
        [student_roll.trim(), batch_id]
    );
    return rows[0] || null;
};

// Bulk Allocate Students with Transaction Safety
exports.bulkAllocate = async (student_rolls, batch_id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let allocatedCount = 0;
        let skippedCount = 0;

        for (const roll of student_rolls) {
            const cleanRoll = String(roll).trim();
            if (!cleanRoll) continue;

            // Check if already allocated to this batch
            const [existing] = await connection.query(
                `SELECT id FROM student_phase_allocations WHERE student_roll = ? AND batch_id = ?`,
                [cleanRoll, batch_id]
            );

            if (existing.length > 0) {
                skippedCount++;
            } else {
                await connection.query(
                    `INSERT INTO student_phase_allocations (student_roll, batch_id) VALUES (?, ?)`,
                    [cleanRoll, batch_id]
                );
                allocatedCount++;
            }
        }

        await connection.commit();
        return { allocatedCount, skippedCount };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get All Allocations
exports.getAllAllocations = async () => {
    const [rows] = await db.query(
        `SELECT spa.*,
                COALESCE(sp.full_name, u.full_name, 'Candidate') AS full_name,
                COALESCE(sp.cgpa, 0) AS cgpa,
                d.dept_name,
                pb.batch_name,
                tp.phase_name
         FROM student_phase_allocations spa
         LEFT JOIN student_profiles sp ON spa.student_roll = sp.roll_number
         LEFT JOIN users u ON spa.student_roll = u.roll_number
         LEFT JOIN departments d ON sp.department_id = d.id
         JOIN phase_batches pb ON spa.batch_id = pb.id
         JOIN training_phases tp ON pb.phase_id = tp.id
         ORDER BY spa.id DESC`
    );
    return rows;
};

// Get Allocations By Batch ID
exports.getAllocationsByBatch = async (batch_id) => {
    const [rows] = await db.query(
        `SELECT spa.*,
                COALESCE(sp.full_name, u.full_name, 'Candidate') AS full_name,
                COALESCE(sp.cgpa, 0) AS cgpa,
                COALESCE(u.email, sp.mobile, '') AS contact_info,
                d.dept_name
         FROM student_phase_allocations spa
         LEFT JOIN student_profiles sp ON spa.student_roll = sp.roll_number
         LEFT JOIN users u ON spa.student_roll = u.roll_number
         LEFT JOIN departments d ON sp.department_id = d.id
         WHERE spa.batch_id = ?
         ORDER BY spa.student_roll ASC`,
        [batch_id]
    );
    return rows;
};

// Get Available (Unallocated) Students for a given batch
exports.getAvailableStudentsForBatch = async (batch_id, search = '') => {
    let query = `
        SELECT 
            COALESCE(sp.roll_number, u.roll_number) AS roll_number,
            COALESCE(sp.full_name, u.full_name) AS full_name,
            u.email,
            COALESCE(sp.cgpa, 0) AS cgpa,
            d.dept_name
        FROM users u
        LEFT JOIN student_profiles sp ON u.roll_number = sp.roll_number OR u.id = sp.user_id
        LEFT JOIN departments d ON sp.department_id = d.id
        WHERE u.role = 'student'
          AND COALESCE(sp.roll_number, u.roll_number) IS NOT NULL
          AND COALESCE(sp.roll_number, u.roll_number) NOT IN (
              SELECT student_roll FROM student_phase_allocations WHERE batch_id = ?
          )
    `;
    const params = [batch_id];

    if (search && search.trim()) {
        query += ` AND (COALESCE(sp.roll_number, u.roll_number) LIKE ? OR COALESCE(sp.full_name, u.full_name) LIKE ?)`;
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY roll_number ASC LIMIT 100`;
    const [rows] = await db.query(query, params);
    return rows;
};

// Get Allocation By ID
exports.getAllocationById = async (id) => {
    const [rows] = await db.query(
        `SELECT * FROM student_phase_allocations WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
};

// Update Allocation
exports.updateAllocation = async (id, student_roll, batch_id) => {
    const [result] = await db.query(
        `UPDATE student_phase_allocations
         SET student_roll = ?, batch_id = ?
         WHERE id = ?`,
        [student_roll.trim(), batch_id, id]
    );
    return result;
};

// Delete Allocation
exports.deleteAllocation = async (id) => {
    const [result] = await db.query(
        `DELETE FROM student_phase_allocations WHERE id = ?`,
        [id]
    );
    return result;
};