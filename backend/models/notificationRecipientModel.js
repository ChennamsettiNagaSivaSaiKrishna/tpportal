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

const getUserNotifications = async (
    userId,
    role
) => {

    const sql = `

        SELECT

            nr.recipient_notification_id,

            nr.is_read,

            nr.read_at,

            n.notification_id,

            n.title,

            n.message,

            n.category,

            n.priority,

            n.sender_id,

            n.sender_role,

            n.created_at

        FROM notification_recipients nr

        INNER JOIN notifications n

        ON nr.notification_id=n.notification_id

        WHERE

            nr.recipient_id=?

            AND

            nr.recipient_role=?

            AND

            nr.is_deleted=FALSE

        ORDER BY

            n.created_at DESC

    `;

    const [rows] = await db.query(sql, [
        userId,
        role
    ]);

    return rows;

};


/**
 * Mark Notification Read
 */

const markAsRead = async (
    notificationId,
    recipientId
) => {

    const sql = `

        UPDATE notification_recipients

        SET

            is_read=TRUE,

            read_at=NOW()

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

module.exports = {

    addRecipient,

    addMultipleRecipients,

    getUserNotifications,

    markAsRead,

    deleteNotification,

    getUnreadCount,

    getRecipients

};