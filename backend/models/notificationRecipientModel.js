const db = require("../config/db");

/**
 * Add Single Recipient
 */
const addRecipient = async (
    connection,
    notificationId,
    recipientId,
    recipientRole
) => {

    const sql = `
        INSERT INTO notification_recipients
        (
            notification_id,
            recipient_id,
            recipient_role
        )
        VALUES (?,?,?)
    `;

    await connection.execute(sql, [
        notificationId,
        recipientId,
        recipientRole
    ]);
};


/**
 * Add Multiple Recipients
 */

const addMultipleRecipients = async (
    notificationId,
    recipients
) => {

    const sql = `
        INSERT INTO notification_recipients
        (
            notification_id,
            recipient_id,
            recipient_role
        )
        VALUES ?
    `;

    const values = recipients.map(recipient => [
        notificationId,
        recipient.recipient_id,
        recipient.recipient_role
    ]);

    await db.query(sql, [values]);

};


/**
 * Get User Notifications
 */

const getMyNotifications = async (recipientId) => {

    const sql = `
        SELECT
            n.notification_id,
            n.title,
            n.message,
            n.category,
            n.priority,
            n.sender_id,
            n.sender_role,
            n.attachment_count,
            n.created_at,
            nr.is_read,
            nr.read_at
        FROM notifications n
        INNER JOIN notification_recipients nr
            ON n.notification_id = nr.notification_id
        WHERE nr.recipient_id = ?
          AND nr.is_deleted = 0
        ORDER BY n.created_at DESC
    `;

    const [rows] = await db.query(sql, [recipientId]);

    return rows;
};


/**
 * Mark Notification Read
 */

const markAsRead = async (
    connection,
    notificationId,
    recipientId
) => {

    const sql = `
        UPDATE notification_recipients
        SET
            is_read = TRUE,
            read_at = NOW()
        WHERE
            notification_id = ?
            AND recipient_id = ?
    `;

    await connection.execute(sql, [
        notificationId,
        recipientId
    ]);

};

/**
 * Soft Delete Notification
 */

const deleteNotification = async (
    notificationId,
    recipientId
) => {

    const sql = `

        UPDATE notification_recipients

        SET

            is_deleted=TRUE,

            deleted_at=NOW()

        WHERE

            notification_id=?

            AND

            recipient_id=?

    `;

    await db.query(sql, [
        notificationId,
        recipientId
    ]);

};


/**
 * Get Unread Count
 */

const getUnreadCount = async (
    userId,
    role
) => {

    const sql = `

        SELECT COUNT(*) AS unread

        FROM notification_recipients

        WHERE

            recipient_id=?

            AND

            recipient_role=?

            AND

            is_read=FALSE

            AND

            is_deleted=FALSE

    `;

    const [rows] = await db.query(sql, [
        userId,
        role
    ]);

    return rows[0].unread;

};


/**
 * Get Notification Recipients (Admin)
 */

const getRecipients = async (
    notificationId
) => {

    const sql = `

        SELECT *

        FROM notification_recipients

        WHERE

            notification_id=?

    `;

    const [rows] = await db.query(sql, [
        notificationId
    ]);

    return rows;

};

/**
 * Get Recipient Notification
 */
const getRecipientNotification = async (
    connection,
    notificationId,
    recipientId
) => {

    const sql = `
        SELECT *
        FROM notification_recipients
        WHERE notification_id = ?
        AND recipient_id = ?
        LIMIT 1
    `;

    const [rows] = await connection.execute(sql, [
        notificationId,
        recipientId
    ]);

    return rows.length > 0 ? rows[0] : null;

};



/**
 * Get Notification By Id
 */
const getNotificationById = async (
    notificationId,
    recipientId
) => {

    const sql = `
        SELECT
            n.*,
            nr.is_read,
            nr.read_at
        FROM notifications n
        INNER JOIN notification_recipients nr
            ON n.notification_id = nr.notification_id
        WHERE n.notification_id = ?
          AND nr.recipient_id = ?
          AND nr.is_deleted = 0
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [
        notificationId,
        recipientId
    ]);

    return rows.length ? rows[0] : null;

};



/**
 * Soft Delete Recipients
 */
const softDeleteRecipients = async (notificationId) => {

    const sql = `
        UPDATE notification_recipients
        SET
            is_deleted = 1,
            deleted_at = NOW()
        WHERE notification_id = ?
    `;

    const [result] = await db.query(sql, [notificationId]);

    return result;

};


/**
 * Search My Notifications
 */
const searchMyNotifications = async (
    recipientId,
    search = "",
    category = "",
    priority = ""
) => {

    let sql = `
        SELECT
            n.notification_id,
            n.title,
            n.message,
            n.category,
            n.priority,
            n.sender_id,
            n.sender_role,
            n.attachment_count,
            n.created_at,
            nr.is_read
        FROM notifications n
        INNER JOIN notification_recipients nr
            ON n.notification_id = nr.notification_id
        WHERE
            nr.recipient_id = ?
            AND nr.is_deleted = 0
            AND n.status = 'ACTIVE'
    `;

    const params = [recipientId];

    if (search) {

        sql += `
            AND (
                n.title LIKE ?
                OR n.message LIKE ?
            )
        `;

        params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {

        sql += ` AND n.category = ? `;

        params.push(category);
    }

    if (priority) {

        sql += ` AND n.priority = ? `;

        params.push(priority);
    }

    sql += ` ORDER BY n.created_at DESC`;

    const [rows] = await db.query(sql, params);

    return rows;

};

module.exports = {

    addRecipient,

    addMultipleRecipients,

    getMyNotifications,

    getRecipientNotification,

    markAsRead,

    deleteNotification,

    getUnreadCount,

    getRecipients,

    getNotificationById,

    softDeleteRecipients,
    searchMyNotifications,
};