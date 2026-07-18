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
                u.id,
                sp.full_name,
                u.email,
                u.role,
                d.dept_name AS department,
                sp.section,
                sp.roll_number,
                sp.year_of_study
            FROM users u
            LEFT JOIN student_profiles sp
                ON u.id = sp.user_id
            LEFT JOIN departments d
                ON sp.department_id = d.id
            WHERE 1=1
        `;

        const params = [];

        if (role) {
            sql += " AND u.role = ?";
            params.push(role);
        }

        if (department) {
            sql += " AND d.dept_name = ?";
            params.push(department);
        }

        if (section) {
            sql += " AND sp.section = ?";
            params.push(section);
        }

        if (search) {
            sql += `
                AND (
                    sp.full_name LIKE ?
                    OR u.email LIKE ?
                    OR sp.roll_number LIKE ?
                )
            `;
            params.push(`%${search}%`);
            params.push(`%${search}%`);
            params.push(`%${search}%`);
        }

        const offset = (Number(page) - 1) * Number(limit);

        sql += " LIMIT ? OFFSET ?";
        params.push(Number(limit));
        params.push(offset);

        let countSql = `
            SELECT COUNT(*) AS total
            FROM users u
            LEFT JOIN student_profiles sp
                ON u.id = sp.user_id
            LEFT JOIN departments d
                ON sp.department_id = d.id
            WHERE 1=1
        `;

        const countParams = [];

        if (role) {
            countSql += " AND u.role = ?";
            countParams.push(role);
        }

        if (department) {
            countSql += " AND d.dept_name = ?";
            countParams.push(department);
        }

        if (section) {
            countSql += " AND sp.section = ?";
            countParams.push(section);
        }

        if (search) {
            countSql += `
                AND (
                    sp.full_name LIKE ?
                    OR u.email LIKE ?
                    OR sp.roll_number LIKE ?
                )
            `;
            countParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        const [users] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
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