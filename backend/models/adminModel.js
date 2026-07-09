const pool = require("../config/db");

exports.getAllUsers = async () => {
    const [rows] = await pool.query(
        "SELECT id, email, role FROM users"
    );

    return rows;
};