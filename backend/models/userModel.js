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
exports.findById = async (userId) => {
    try {
      const query = `
        SELECT id, full_name, email, role, roll_number, department_id, is_active, created_at
        FROM users
        WHERE id = ?
      `;
      const [rows] = await db.query(query, [userId]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  };