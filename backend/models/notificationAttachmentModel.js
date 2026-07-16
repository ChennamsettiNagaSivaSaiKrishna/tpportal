const db = require("../config/db");

/**
 * Add Attachment
 */
const addAttachment = async (attachmentData) => {

    const sql = `
        INSERT INTO notification_attachments
        (
            notification_id,
            original_file_name,
            stored_file_name,
            file_path,
            file_type,
            file_size
        )
        VALUES (?,?,?,?,?,?)
    `;

    const values = [
        attachmentData.notification_id,
        attachmentData.original_file_name,
        attachmentData.stored_file_name,
        attachmentData.file_path,
        attachmentData.file_type,
        attachmentData.file_size
    ];

    const [result] = await db.query(sql, values);

    return result.insertId;
};


/**
 * Add Multiple Attachments
 */
const addMultipleAttachments = async (
    notificationId,
    attachments
) => {

    if (!attachments || attachments.length === 0) {
        return;
    }

    const sql = `
        INSERT INTO notification_attachments
        (
            notification_id,
            original_file_name,
            stored_file_name,
            file_path,
            file_type,
            file_size
        )
        VALUES ?
    `;

    const values = attachments.map(file => [
        notificationId,
        file.originalname,
        file.filename,
        file.path,
        file.mimetype,
        file.size
    ]);

    await db.query(sql, [values]);
};


/**
 * Get Attachments By Notification
 */
const getAttachmentsByNotificationId = async (
    notificationId
) => {

    const sql = `
        SELECT *
        FROM notification_attachments
        WHERE notification_id = ?
        ORDER BY uploaded_at ASC
    `;

    const [rows] = await db.query(sql, [
        notificationId
    ]);

    return rows;
};


/**
 * Get Attachment By ID
 */
const getAttachmentById = async (
    attachmentId
) => {

    const sql = `
        SELECT *
        FROM notification_attachments
        WHERE attachment_id = ?
    `;

    const [rows] = await db.query(sql, [
        attachmentId
    ]);

    return rows[0];
};


/**
 * Delete Attachment
 */
const deleteAttachment = async (
    attachmentId
) => {

    const sql = `
        DELETE FROM notification_attachments
        WHERE attachment_id = ?
    `;

    await db.query(sql, [
        attachmentId
    ]);
};


/**
 * Delete All Attachments of Notification
 */
const deleteAttachmentsByNotificationId = async (
    notificationId
) => {

    const sql = `
        DELETE FROM notification_attachments
        WHERE notification_id = ?
    `;

    await db.query(sql, [
        notificationId
    ]);
};


/**
 * Count Attachments
 */
const getAttachmentCount = async (
    notificationId
) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM notification_attachments
        WHERE notification_id = ?
    `;

    const [rows] = await db.query(sql, [
        notificationId
    ]);

    return rows[0].total;
};


module.exports = {

    addAttachment,

    addMultipleAttachments,

    getAttachmentsByNotificationId,

    getAttachmentById,

    deleteAttachment,

    deleteAttachmentsByNotificationId,

    getAttachmentCount

};