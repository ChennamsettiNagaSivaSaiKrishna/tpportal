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
exports.createUser = async (email, passwordHash, role) => {
    const [result] = await db.query(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
        [email, passwordHash, role]
    );
    return result;
};

// Find user by ID
exports.findById = async (id) => {
    const [rows] = await db.query(
        "SELECT id, email, role, is_active FROM users WHERE id = ?",
        [id]
    );
    return rows[0];
};