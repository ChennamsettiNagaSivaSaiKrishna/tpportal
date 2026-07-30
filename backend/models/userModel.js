const db = require("../config/db");

// Find user by email
exports.findByEmail = async (email) => {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows[0];
};

// Create new user 
exports.createUser = async (email, passwordHash, fullName = '', rollNumber = '', role = 'student', departmentId = 1) => {
    const [result] = await db.query(
        "INSERT INTO users (email, password_hash, full_name, roll_number, role, department_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [email, passwordHash, fullName, rollNumber, role, departmentId, 1]
    );
    return result;
};

// Find user by ID and attach their dynamic group/role profiles safely matching existing columns
exports.findById = async (id) => {
    const [rows] = await db.query(
        `SELECT u.id, u.email, u.is_active, u.role, u.department_id,
                GROUP_CONCAT(g.group_name) AS assigned_groups
         FROM users u
         LEFT JOIN user_group_mappings ugm ON u.id = ugm.user_id
         LEFT JOIN user_groups g ON ugm.group_id = g.id
         WHERE u.id = ?
         GROUP BY u.id`,
        [id]
    );
    
    if (!rows[0]) return null;

    // Map properties safely so the frontend profile form gets expected fields without crashing
    const user = rows[0];
    return {
        ...user,
        full_name: user.full_name || user.name || '',
        branch: user.branch || '',
        cgpa: user.cgpa || 0,
        phone_number: user.phone_number || ''
    };
};