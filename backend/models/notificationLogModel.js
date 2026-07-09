const db = require("../config/db");

// Add Notification
exports.addNotification = async (
    student_roll,
    notification_type,
    recipient_mobile,
    delivery_status
) => {

    const [result] = await db.execute(
        `INSERT INTO notification_logs
        (
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        )
        VALUES (?, ?, ?, ?)`,
        [
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        ]
    );

    return result;
};

// Get All Notifications
exports.getAllNotifications = async () => {

    const [rows] = await db.execute(
        `SELECT *
         FROM notification_logs
         ORDER BY id DESC`
    );

    return rows;
};

// Get Notification By ID
exports.getNotificationById = async (id) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM notification_logs
         WHERE id = ?`,
        [id]
    );

    return rows;
};

// Update Notification
exports.updateNotification = async (
    id,
    student_roll,
    notification_type,
    recipient_mobile,
    delivery_status
) => {

    const [result] = await db.execute(
        `UPDATE notification_logs
         SET
            student_roll = ?,
            notification_type = ?,
            recipient_mobile = ?,
            delivery_status = ?
         WHERE id = ?`,
        [
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status,
            id
        ]
    );

    return result;
};

// Delete Notification
exports.deleteNotification = async (id) => {

    const [result] = await db.execute(
        `DELETE FROM notification_logs
         WHERE id = ?`,
        [id]
    );

    return result;
};