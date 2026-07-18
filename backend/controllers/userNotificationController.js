const db = require("../config/db");

/**
 * Get Users for Notification
 */
exports.getUsers = async (req, res) => {

    try {

      const {

    role,

    department,

    section,

    search,

    page = 1,

    limit = 10

} = req.query;

        let sql = `
            SELECT
                id,
                full_name,
                email,
                role,
                department,
                section
            FROM users
            WHERE 1=1
        `;

        const params = [];
        if (role) {

    sql += " AND role = ?";

    params.push(role);

}

if (department) {

    sql += " AND department = ?";

    params.push(department);

}

if (section) {

    sql += " AND section = ?";

    params.push(section);

}

if (search) {

    sql += `
        AND (
            full_name LIKE ?
            OR email LIKE ?
        )
    `;

    params.push(`%${search}%`);

    params.push(`%${search}%`);

}
const offset = (page - 1) * limit;

sql += " LIMIT ? OFFSET ?";

params.push(Number(limit));

params.push(Number(offset));

let countSql = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE 1=1
`;

const countParams = [];

if (role) {

    countSql += " AND role = ?";

    countParams.push(role);

}

if (department) {

    countSql += " AND department = ?";

    countParams.push(department);

}

if (section) {

    countSql += " AND section = ?";

    countParams.push(section);

}

if (search) {

    countSql += `
        AND (
            full_name LIKE ?
            OR email LIKE ?
        )
    `;

    countParams.push(`%${search}%`);

    countParams.push(`%${search}%`);

}
const [countResult] = await db.query(
    countSql,
    countParams
);

const total = countResult[0].total;

const totalPages = Math.ceil(total / limit);

const [users] = await db.query(sql, params);

return res.status(200).json({

    success: true,

    currentPage: Number(page),

    totalPages,

    totalRecords: total,

    count: users.length,

    users

});

} catch (error) {

    console.error(error);

    return res.status(500).json({

        success: false,

        message: "Failed to fetch users.",

        error: error.message

    });

}

};
       