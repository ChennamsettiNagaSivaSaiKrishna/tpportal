const db = require("../config/db");

/**
 * Create Audit Log
 */
const createAuditLog = async (connection, auditData) => {

    const sql = `
        INSERT INTO notification_audit_logs
        (
            notification_id,
            action,
            action_by,
            action_role,
            remarks
        )
        VALUES (?,?,?,?,?)
    `;

    const values = [
        auditData.notification_id,
        auditData.action,
        auditData.action_by,
        auditData.action_role,
        auditData.remarks || null
    ];

    const [result] = await connection.execute(sql, values);

    return result.insertId;

};

/**
 * Get Audit Logs By Notification
 */
const getAuditLogsByNotificationId = async (notificationId) => {

    const sql = `
        SELECT *
        FROM notification_audit_logs
        WHERE notification_id = ?
        ORDER BY action_time DESC
    `;

    const [rows] = await db.query(sql, [notificationId]);

    return rows;
};


/**
 * Get Audit Log By ID
 */
const getAuditLogById = async (auditId) => {

    const sql = `
        SELECT *
        FROM notification_audit_logs
        WHERE audit_id = ?
    `;

    const [rows] = await db.query(sql, [auditId]);

    return rows[0];
};


/**
 * Get All Audit Logs
 * (Admin Only)
 */
const getAllAuditLogs = async () => {

    const sql = `
        SELECT *
        FROM notification_audit_logs
        ORDER BY action_time DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};


/**
 * Delete Audit Logs By Notification
 * (Automatically handled by CASCADE,
 * but useful if needed)
 */
const deleteAuditLogsByNotificationId = async (notificationId) => {

    const sql = `
        DELETE
        FROM notification_audit_logs
        WHERE notification_id = ?
    `;

    await db.query(sql, [notificationId]);
};


/**
 * Delete Single Audit Log
 * (Admin Only)
 */
const deleteAuditLog = async (auditId) => {

    const sql = `
        DELETE
        FROM notification_audit_logs
        WHERE audit_id = ?
    `;

    await db.query(sql, [auditId]);
};


module.exports = {

    createAuditLog,

    getAuditLogsByNotificationId,

    getAuditLogById,

    getAllAuditLogs,

    deleteAuditLogsByNotificationId,

    deleteAuditLog

};