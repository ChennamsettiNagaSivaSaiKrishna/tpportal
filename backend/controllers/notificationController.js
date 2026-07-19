const db = require('../config/db');
const jwt = require('jsonwebtoken');

/**
 * Extracts session user details from standard req targets or directly from headers
 */
const extractUserContext = (req) => {
    const context = req.user || req.auth || req.decoded || req.tokenPayload;
    if (context && context.id) return context;

    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token); 
            if (decoded && (decoded.id || decoded.userId)) {
                return {
                    id: decoded.id || decoded.userId,
                    role: decoded.role || 'student'
                };
            }
        }
    } catch (err) {
        console.error("Inline user context parsing failed:", err);
    }
    return null;
};

/**
 * Checks dynamic communication permissions matrix bounds
 */
const checkCommunicationPermission = (senderRole, receiverRole) => {
    if (!senderRole || !receiverRole) return false;
    
    const sRole = senderRole.toLowerCase();
    const rRole = receiverRole.toLowerCase();

    // High privilege tiers can always read/write all system role assets
    if (['admin', 'management', 'placement_officer', 'placement_coordinator', 'placement_head', 'training_head'].includes(sRole)) {
        return true;
    }

    // Direct student role capability parameters
    const matrix = {
        student: ['placement_coordinator', 'hod', 'placement_officer', 'placement_head', 'training_head']
    };
    
    return matrix[sRole]?.includes(rRole) || false;
};

/**
 * GET /api/notifications/eligible-recipients
 */
exports.getEligibleRecipients = async (req, res) => {
    try {
        const userContext = extractUserContext(req);
        if (!userContext) return res.status(401).json({ success: false, message: "Unauthorized context signature." });

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
                sp.roll_number AS student_roll,
                sp.section AS student_section,
                sp.department_id AS student_dept_id,
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
            
            // Limit: Students can only locate the HOD that belongs to their branch
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

            return {
                user_id: u.user_id,
                role: u.role,
                email: u.email,
                full_name: resolvedName,
                roll_number: u.student_roll || '',
                section: u.student_section || '',
                department_id: u.role === 'hod' ? u.hod_dept_id : (u.student_dept_id || '')
            };
        });

        return res.status(200).json({ success: true, data: mappedData });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error compiling recipient grid map arrays." });
    }
};

/**
 * POST /api/notifications/send
 */
exports.sendNotification = async (req, res) => {
    let connection;
    try {
        const userContext = extractUserContext(req);
        if (!userContext) return res.status(401).json({ success: false, message: "Unauthorized." });

        connection = await db.getConnection();
        await connection.beginTransaction();
        
        const { title, message, priority, recipient_ids } = req.body;
        if (!title || !message || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid message layout mapping." });
        }

        const [navRow] = await connection.execute(
            `INSERT INTO notifications (title, message, category, priority, sender_id, sender_role, status) 
             VALUES (?, ?, 'DIRECT_MSG', ?, ?, ?, 'ACTIVE')`,
            [title, message, priority || 'NORMAL', userContext.id, userContext.role]
        );
        const notificationId = navRow.insertId;

        for (const recipientId of recipient_ids) {
            const [rUser] = await connection.execute('SELECT role FROM users WHERE id = ?', [recipientId]);
            if (!rUser.length) continue;

            await connection.execute(
                `INSERT INTO notification_recipients (notification_id, recipient_id, recipient_role) VALUES (?, ?, ?)`,
                [notificationId, recipientId, rUser[0].role]
            );
        }

        await connection.commit();
        return res.status(200).json({ success: true, message: "Dispatched cleanly." });
    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(500).json({ success: false, message: "Transaction database recovery roll back." });
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
            return res.status(401).json({ success: false, message: "Unauthorized: Access signature context missing." });
        }

        const userId = userContext.id;
        const userRole = userContext.role.toLowerCase().trim();

        let query = '';
        let params = [];

        // Safe operational fallback: Checks table structural metrics dynamically to avoid structural column layout failure errors
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'is_edited'
        `);
        const hasIsEditedColumn = columns.length > 0;
        const editFieldSelection = hasIsEditedColumn ? 'COALESCE(n.is_edited, FALSE)' : 'FALSE';

        if (userRole === 'admin') {
            query = `
                SELECT 
                    n.notification_id, n.title, n.message, n.priority, n.sender_role, n.created_at, n.sender_id, n.status,
                    FALSE AS is_read, 0 AS recipient_notification_id, ${editFieldSelection} AS is_edited,
                    u.email AS user_email
                FROM notifications n
                INNER JOIN users u ON n.sender_id = u.id
                WHERE n.status != 'DELETED'
                ORDER BY n.created_at DESC
            `;
        } else {
            query = `
                SELECT DISTINCT
                    n.notification_id, n.title, n.message, n.priority, n.sender_role, n.created_at, n.sender_id, n.status,
                    COALESCE(nr.is_read, FALSE) AS is_read,
                    COALESCE(nr.recipient_notification_id, 0) AS recipient_notification_id,
                    ${editFieldSelection} AS is_edited,
                    u.email AS user_email
                FROM notifications n
                INNER JOIN users u ON n.sender_id = u.id
                LEFT JOIN notification_recipients nr ON n.notification_id = nr.notification_id
                WHERE n.status != 'DELETED' 
                  AND (
                    (nr.recipient_id = ? AND nr.is_deleted = FALSE) 
                    OR (LOWER(TRIM(nr.recipient_role)) = ? AND nr.is_deleted = FALSE)
                    OR (n.sender_id = ?)
                  )
                ORDER BY n.created_at DESC
            `;
            params = [userId, userRole, userId];
        }
        
        const [rows] = await db.execute(query, params);
        
        const mappedRows = rows.map(r => {
            const createdTime = new Date(r.created_at).getTime();
            const currentTime = Date.now();
            const diffMinutes = (currentTime - createdTime) / (1000 * 60);
            
            const isEditable = (diffMinutes <= 15 && Number(r.sender_id) === Number(userId)) || userRole === 'admin';

            return {
                notification_id: r.notification_id,
                title: r.title,
                message: r.message,
                priority: r.priority,
                sender_role: r.sender_role,
                created_at: r.created_at,
                is_read: r.is_read,
                recipient_notification_id: r.recipient_notification_id,
                sender_name: r.user_email,
                is_my_outgoing: Number(r.sender_id) === Number(userId),
                is_editable: isEditable,
                is_edited: r.is_edited
            };
        });

        return res.status(200).json({ success: true, data: mappedRows });
    } catch (err) {
        console.error("Critical Failure inside getInbox ledger compilation layer:", err);
        return res.status(500).json({ success: false, message: "Inbox connection registry sync dropped." });
    }
};

/**
 * PUT /api/notifications/edit/:id
 */
exports.editNotification = async (req, res) => {
    try {
        const userContext = extractUserContext(req);
        if (!userContext) return res.status(401).json({ success: false, message: "Unauthorized." });

        const { id } = req.params;
        const { title, message } = req.body;

        const [rows] = await db.execute('SELECT sender_id, created_at FROM notifications WHERE notification_id = ?', [id]);
        if (!rows.length) return res.status(404).json({ success: false, message: "Notification context not found." });

        if (Number(rows[0].sender_id) !== Number(userContext.id) && userContext.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: Modification rights denied." });
        }

        const diffMinutes = (Date.now() - new Date(rows[0].created_at).getTime()) / (1000 * 60);
        if (diffMinutes > 15 && userContext.role.toLowerCase() !== 'admin') {
            return res.status(400).json({ success: false, message: "Time limit expired. Modification window locked after 15 minutes." });
        }

        await db.execute(
            'UPDATE notifications SET title = ?, message = ?, is_edited = TRUE, updated_at = NOW() WHERE notification_id = ?',
            [title, message, id]
        );
        return res.status(200).json({ success: true, message: "Notification layout modified successfully." });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to update notification." });
    }
};

/**
 * DELETE /api/notifications/delete/:id
 */
exports.deleteNotification = async (req, res) => {
    try {
        const userContext = extractUserContext(req);
        if (!userContext) return res.status(401).json({ success: false, message: "Unauthorized." });

        const { id } = req.params;
        const [rows] = await db.execute('SELECT sender_id, created_at FROM notifications WHERE notification_id = ?', [id]);
        if (!rows.length) return res.status(404).json({ success: false, message: "Notification array record missing." });

        if (Number(rows[0].sender_id) !== Number(userContext.id) && userContext.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: Deletion rights denied." });
        }

        const diffMinutes = (Date.now() - new Date(rows[0].created_at).getTime()) / (1000 * 60);
        if (diffMinutes > 15 && userContext.role.toLowerCase() !== 'admin') {
            return res.status(400).json({ success: false, message: "Time limit expired. Recall window closed after 15 minutes." });
        }

        await db.execute('UPDATE notification_recipients SET is_deleted = TRUE WHERE notification_id = ?', [id]);
        await db.execute("UPDATE notifications SET status = 'DELETED' WHERE notification_id = ?", [id]);

        return res.status(200).json({ success: true, message: "Notification recalled completely." });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Scrub operation fault." });
    }
};

/**
 * PATCH /api/notifications/read/:id
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`UPDATE notification_recipients SET is_read = TRUE, read_at = NOW() WHERE recipient_notification_id = ?`, [id]);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
};