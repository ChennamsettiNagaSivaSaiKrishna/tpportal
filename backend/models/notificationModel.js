const db = require("../config/db");

/**
 * Create Notification
 */
const createNotification = async (connection, notificationData) => {
    const sql = `
        INSERT INTO notifications
        (
            title,
            message,
            category,
            priority,
            sender_id,
            sender_role,
            attachment_count
        )
        VALUES (?,?,?,?,?,?,?)
    `;

    const values = [
        notificationData.title,
        notificationData.message,
        notificationData.category,
        notificationData.priority,
        notificationData.sender_id,
        notificationData.sender_role,
        notificationData.attachment_count || 0
    ];

  const [result] = await connection.execute(sql, values);

    return result.insertId;
};

/**
 * Get Notification By ID
 */

const getNotificationById = async (notificationId) => {

    const sql = `
        SELECT *
        FROM notifications
        WHERE notification_id = ?
    `;

    const [rows] = await db.query(sql,[notificationId]);

    return rows[0];

};

/**
 * Update Notification
 */

const updateNotification = async (notificationId,data)=>{

    const sql = `
        UPDATE notifications
        SET
            title=?,
            message=?,
            category=?,
            priority=?
        WHERE notification_id=?
    `;

    await db.query(sql,[
        data.title,
        data.message,
        data.category,
        data.priority,
        notificationId
    ]);

};

/**
 * Delete Notification (Admin)
 */

const deleteNotification = async(notificationId)=>{

    await db.query(
        "DELETE FROM notifications WHERE notification_id=?",
        [notificationId]
    );

};


/**
 * Update Attachment Count
 */
const updateAttachmentCount = async (
    connection,
    notificationId,
    attachmentCount
) => {

    const sql = `
        UPDATE notifications
        SET attachment_count = ?
        WHERE notification_id = ?
    `;

    await connection.execute(sql, [
        attachmentCount,
        notificationId
    ]);

};



module.exports = {
    createNotification,
    getNotificationById,
    updateNotification,
    updateAttachmentCount,
    deleteNotification
};



