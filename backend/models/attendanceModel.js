const db = require("../config/db"); // Your primary database pool engine thread reference

const AttendanceModel = {
    // 1. Finds or instantiates a row inside training_sessions for the slot context
    getOrCreateSession: async (batchId, date, slot) => {
        const [existing] = await db.execute(
            'SELECT id, attendance_locked FROM training_sessions WHERE batch_id = ? AND session_date = ? AND session_slot = ?',
            [batchId, date, slot]
        );

        if (existing.length > 0) return existing[0];

        // Fallback: create context row if it doesn't exist
        const [inserted] = await db.execute(
            `INSERT INTO training_sessions (batch_id, session_date, session_slot, topic) VALUES (?, ?, ?, 'Dynamic Batch Session')`,
            [batchId, date, slot]
        );
        return { id: inserted.insertId, attendance_locked: 0 };
    },

    // 2. Resolves cross-branch students combined with their unique tracking status
    getSheetRecords: async (sessionId, batchId) => {
        const query = `
            SELECT 
                sp.roll_number,
                sp.full_name,
                d.dept_name,
                IFNULL(att.attendance_status, 'Absent') AS attendance_status
            FROM student_batch_mappings sbm
            INNER JOIN student_profiles sp ON sbm.student_roll = sp.roll_number
            INNER JOIN departments d ON sp.department_id = d.id
            LEFT JOIN attendance att ON att.session_id = ? AND att.student_roll = sp.roll_number
            WHERE sbm.batch_id = ?
            ORDER BY sp.roll_number ASC
        `;
        const [rows] = await db.execute(query, [sessionId, batchId]);
        return rows;
    },

    // 3. Simple verification tool checking lock criteria constraints
    checkSessionLockState: async (sessionId) => {
        const [rows] = await db.execute('SELECT attendance_locked FROM training_sessions WHERE id = ?', [sessionId]);
        return rows.length > 0 ? !!rows[0].attendance_locked : false;
    },

    // 4. Handles transactional multi-row SQL upserts
    saveBulkRecords: async (sessionId, records, userId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const upsertQuery = `
                INSERT INTO attendance (session_id, student_roll, attendance_status)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE attendance_status = VALUES(attendance_status)
            `;

            for (const item of records) {
                // Maps checkbox strings back to ENUM ('Present', 'Absent')
                await connection.execute(upsertQuery, [sessionId, item.student_roll, item.status]);
            }

            // Bind the active authority metadata marker back to the control tracking block
            await connection.execute(
                'UPDATE training_sessions SET marked_by = ? WHERE id = ?',
                [userId, sessionId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = AttendanceModel;