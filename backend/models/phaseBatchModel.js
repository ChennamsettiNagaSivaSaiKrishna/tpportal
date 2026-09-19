const db = require("../config/db");

// Add Batch
exports.addBatch = async (phase_id, batch_name, description = '', trainer_name = '', room_no = '') => {
    const [result] = await db.query(
        `INSERT INTO phase_batches
        (phase_id, batch_name, description, trainer_name, room_no)
        VALUES (?, ?, ?, ?, ?)`,
        [phase_id, batch_name, description, trainer_name, room_no]
    );
    return result;
};

// Get All Batches with student counts
exports.getAllBatches = async () => {
    const [rows] = await db.query(
        `SELECT pb.*,
                tp.phase_name,
                tp.academic_year,
                COUNT(spa.id) AS student_count
         FROM phase_batches pb
         JOIN training_phases tp ON pb.phase_id = tp.id
         LEFT JOIN student_phase_allocations spa ON pb.id = spa.batch_id
         GROUP BY pb.id
         ORDER BY pb.id DESC`
    );
    return rows;
};

// Get Batches By Phase ID
exports.getBatchesByPhase = async (phase_id) => {
    const [rows] = await db.query(
        `SELECT pb.*,
                tp.phase_name,
                COUNT(spa.id) AS student_count
         FROM phase_batches pb
         JOIN training_phases tp ON pb.phase_id = tp.id
         LEFT JOIN student_phase_allocations spa ON pb.id = spa.batch_id
         WHERE pb.phase_id = ?
         GROUP BY pb.id
         ORDER BY pb.id ASC`,
        [phase_id]
    );
    return rows;
};

// Get Batch By ID with allocated student list
exports.getBatchById = async (id) => {
    const [rows] = await db.query(
        `SELECT pb.*,
                tp.phase_name,
                tp.academic_year
         FROM phase_batches pb
         JOIN training_phases tp ON pb.phase_id = tp.id
         WHERE pb.id = ?`,
        [id]
    );
    if (rows.length === 0) return null;

    const batch = rows[0];

    // Fetch allocated students
    const [students] = await db.query(`
        SELECT spa.id AS allocation_id,
               spa.student_roll,
               spa.created_at AS allocated_at,
               COALESCE(sp.full_name, u.full_name, 'Candidate') AS full_name,
               COALESCE(sp.cgpa, 0) AS cgpa,
               d.dept_name
        FROM student_phase_allocations spa
        LEFT JOIN student_profiles sp ON spa.student_roll = sp.roll_number
        LEFT JOIN users u ON spa.student_roll = u.roll_number
        LEFT JOIN departments d ON sp.department_id = d.id
        WHERE spa.batch_id = ?
        ORDER BY spa.student_roll ASC
    `, [id]);

    batch.students = students;
    batch.student_count = students.length;
    return batch;
};

// Update Batch
exports.updateBatch = async (id, phase_id, batch_name, description, trainer_name, room_no) => {
    const [result] = await db.query(
        `UPDATE phase_batches
         SET
            phase_id = COALESCE(?, phase_id),
            batch_name = COALESCE(?, batch_name),
            description = COALESCE(?, description),
            trainer_name = COALESCE(?, trainer_name),
            room_no = COALESCE(?, room_no)
         WHERE id = ?`,
        [phase_id, batch_name, description, trainer_name, room_no, id]
    );
    return result;
};

// Delete Batch
exports.deleteBatch = async (id) => {
    const [result] = await db.query(
        `DELETE FROM phase_batches WHERE id = ?`,
        [id]
    );
    return result;
};
