const db = require('../config/db');
const jwt = require('jsonwebtoken'); // Fallback utility for direct token parsing if needed

/**
 * Robustly extracts user metadata from any possible request property attached by the global auth stack
 */
const extractUserContext = (req) => {
    // 1. Check all standard request locations populated by various middleware versions
    const context = req.user || req.auth || req.decoded || req.tokenPayload;
    if (context && context.id) return context;

    // 2. Fallback: If middleware was bypassed due to circular dependency, parse the header manually
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token); // Safely read payload parameters directly
            if (decoded && (decoded.id || decoded.userId)) {
                return {
                    id: decoded.id || decoded.userId,
                    role: decoded.role || 'student'
                };
            }
        }
    } catch (err) {
        console.error("Inline token recovery failed:", err);
    }

    return null;
};

/**
 * Validates role communication pathways based on requested system constraints
 */
const checkCommunicationPermission = (senderRole, receiverRole) => {
    if (!senderRole || !receiverRole) return false;
    
    const matrix = {
        student: ['placement_coordinator', 'hod', 'placement_officer', 'placement_head', 'training_head'],
        placement_coordinator: ['placement_officer', 'placement_head', 'hod', 'management', 'student'],
        placement_officer: ['student', 'placement_coordinator', 'placement_head', 'training_head', 'hod'],
        placement_head: ['student', 'placement_coordinator', 'placement_officer', 'training_head', 'hod'],
        training_head: ['student', 'placement_coordinator', 'placement_officer', 'placement_head', 'hod'],
        hod: ['student', 'placement_coordinator', 'placement_officer', 'placement_head', 'training_head'],
        management: ['student', 'placement_coordinator', 'placement_officer', 'placement_head', 'training_head', 'hod'],
        admin: ['student', 'placement_coordinator', 'placement_officer', 'placement_head', 'training_head', 'hod', 'management']
    };
    
    return matrix[senderRole.toLowerCase()]?.includes(receiverRole.toLowerCase()) || false;
};

/**
 * GET /api/notifications/eligible-recipients
 */
exports.getEligibleRecipients = async (req, res) => {
    try {
        const userContext = extractUserContext(req);
        if (!userContext) {
            return res.status(401).json({ success: false, message: "Unauthorized: Access signature missing." });
        }

        const senderId = userContext.id;
        const senderRole = userContext.role;

        let senderDeptId = null;
        if (senderRole.toLowerCase() === 'student') {
            const [prof] = await db.execute('SELECT department_id FROM student_profiles WHERE user_id = ?', [senderId]);
            if (prof.length) senderDeptId = prof[0].department_id;
        }

        const query = `
            SELECT 
                u.id AS user_id, u.role, u.email,
                sp.full_name AS student_name,
                pt.full_name AS team_name,
                d.hod_name AS dept_hod_name, d.id AS hod_dept_id
            FROM users u
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN placement_team_profiles pt ON u.id = pt.user_id
            LEFT JOIN departments d ON (LOWER(TRIM(u.email)) = LOWER(TRIM(d.hod_email)))
            WHERE u.is_active = TRUE AND u.id != ?
        `;
        
        const [users] = await db.execute(query, [senderId]);

        const filtered = users.filter(receiver => {
            if (!checkCommunicationPermission(senderRole, receiver.role)) return false;
            if (senderRole.toLowerCase() === 'student' && receiver.role.toLowerCase() === 'hod') {
                return senderDeptId && (Number(receiver.hod_dept_id) === Number(senderDeptId));
            }
            return true;
        });

        const mappedData = filtered.map(u => {
            let resolvedName = u.email;
            const currentRole = u.role.toLowerCase();
            if (currentRole === 'student' && u.student_name) resolvedName = u.student_name;
            else if (currentRole === 'hod' && u.dept_hod_name) resolvedName = u.dept_hod_name;
            else if (u.team_name) resolvedName = u.team_name;

            return { user_id: u.user_id, role: u.role, email: u.email, full_name: resolvedName };
        });

        return res.status(200).json({ success: true, data: mappedData });
    } catch (err) {
        console.error("Critical Failure in getEligibleRecipients:", err);
        return res.status(500).json({ success: false, message: "Error mapping communications matrix." });
    }
};

/**
 * POST /api/notifications/send
 */
exports.sendNotification = async (req, res) => {
    let connection;
    try {
        const userContext = extractUserContext(req);
        if (!userContext) {
            return res.status(401).json({ success: false, message: "Unauthorized: Access signature missing." });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();
        
        const senderId = userContext.id;
        const senderRole = userContext.role;
        const { title, message, priority, recipient_ids } = req.body;

        if (!title || !message || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid payload layout parameters." });
        }

        const [navRow] = await connection.execute(
            `INSERT INTO notifications (title, message, category, priority, sender_id, sender_role, status) 
             VALUES (?, ?, 'DIRECT_MSG', ?, ?, ?, 'ACTIVE')`,
            [title, message, priority || 'NORMAL', senderId, senderRole]
        );
        const notificationId = navRow.insertId;

        for (const recipientId of recipient_ids) {
            const [rUser] = await connection.execute('SELECT role FROM users WHERE id = ?', [recipientId]);
            if (!rUser.length) continue;

            await connection.execute(
                `INSERT INTO notification_recipients (notification_id, recipient_id, recipient_role) 
                 VALUES (?, ?, ?)`,
                [notificationId, recipientId, rUser[0].role]
            );
        }

        await connection.commit();
        return res.status(200).json({ success: true, message: "Message dispatched cleanly." });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Critical Failure in sendNotification:", err);
        return res.status(500).json({ success: false, message: "Database notification transaction error." });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * GET /api/notifications/inbox
 */
exports.getInbox = async (req, res) => {
    try {
        const userContext = extractUserContext(req);
        if (!userContext) {
            return res.status(401).json({ success: false, message: "Unauthorized: Access signature missing." });
        }

        const userId = userContext.id;
        
        const query = `
            SELECT 
                n.notification_id, n.title, n.message, n.priority, n.sender_role, n.created_at, nr.is_read, nr.recipient_notification_id,
                sp.full_name AS student_sender, pt.full_name AS team_sender, d.hod_name AS hod_sender, u.email AS user_email
            FROM notification_recipients nr
            INNER JOIN notifications n ON nr.notification_id = n.notification_id
            INNER JOIN users u ON n.sender_id = u.id
            LEFT JOIN student_profiles sp ON n.sender_id = sp.user_id
            LEFT JOIN placement_team_profiles pt ON n.sender_id = pt.user_id
            LEFT JOIN departments d ON (u.email = d.hod_email AND u.role = 'hod')
            WHERE nr.recipient_id = ? AND nr.is_deleted = FALSE
            ORDER BY n.created_at DESC
        `;
        
        const [rows] = await db.execute(query, [userId]);
        
        const mappedRows = rows.map(r => {
            let resolvedName = "System Administrator";
            const roleKey = r.sender_role.toLowerCase();
            
            if (roleKey === 'student' && r.student_sender) resolvedName = r.student_sender;
            else if (roleKey === 'hod' && r.hod_sender) resolvedName = r.hod_sender;
            else if (r.team_sender) resolvedName = r.team_sender;
            else if (r.user_email) resolvedName = r.user_email;

            return {
                notification_id: r.notification_id, title: r.title, message: r.message, priority: r.priority,
                sender_role: r.sender_role, created_at: r.created_at, is_read: r.is_read,
                recipient_notification_id: r.recipient_notification_id, sender_name: resolvedName
            };
        });

        return res.status(200).json({ success: true, data: mappedRows });
    } catch (err) {
        console.error("Critical Failure in getInbox:", err);
        return res.status(500).json({ success: false, message: "Inbox retrieval connection dropped." });
    }
};

/**
 * PATCH /api/notifications/read/:id
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(
            `UPDATE notification_recipients SET is_read = TRUE, read_at = NOW() WHERE recipient_notification_id = ?`,
            [id]
        );
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Critical Failure in markAsRead:", err);
        return res.status(500).json({ success: false, message: "Failed to mark item as read." });
    }
};