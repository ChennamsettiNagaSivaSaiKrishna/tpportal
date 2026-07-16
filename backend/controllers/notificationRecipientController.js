const db = require("../config/db");

const recipientModel = require("../models/notificationRecipientModel");
const auditModel = require("../models/notificationAuditModel");

/**
 * Mark Notification as Read
 */
exports.markAsRead = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const notificationId = req.params.notificationId;

        const recipientId = req.user.id;

        const recipientRole = req.user.role;

        // Check recipient exists
        const recipient =
            await recipientModel.getRecipientNotification(
                connection,
                notificationId,
                recipientId
            );

        if (!recipient) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message: "Notification not found."

            });

        }

        // Already read
        if (recipient.is_read) {

            await connection.rollback();

            return res.status(200).json({

                success: true,

                message: "Notification already marked as read."

            });

        }

        // Update read status
        await recipientModel.markAsRead(

            connection,

            notificationId,

            recipientId

        );


                // Audit Log
        await auditModel.createAuditLog(connection, {

            notification_id: notificationId,

            action: "READ",

            action_by: recipientId,

            action_role: recipientRole,

            remarks: "Notification marked as read"

        });

        await connection.commit();

        return res.status(200).json({

            success: true,

            message: "Notification marked as read successfully."

        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to mark notification as read.",

            error: error.message

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};





/**
 * Delete Notification For Recipient
 */
exports.deleteNotification = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const notificationId = req.params.notificationId;

        const recipientId = req.user.id;

        const recipientRole = req.user.role;

        const recipient =
            await recipientModel.getRecipientNotification(
                connection,
                notificationId,
                recipientId
            );

        if (!recipient) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message: "Notification not found."

            });

        }

                // Already deleted
        if (recipient.is_deleted) {

            await connection.rollback();

            return res.status(200).json({

                success: true,

                message: "Notification already deleted."

            });

        }

        // Soft delete for recipient
        await recipientModel.deleteRecipientNotification(

            connection,

            notificationId,

            recipientId

        );

        // Audit Log
        await auditModel.createAuditLog(connection, {

            notification_id: notificationId,

            action: "DELETED",

            action_by: recipientId,

            action_role: recipientRole,

            remarks: "Recipient deleted notification"

        });

                await connection.commit();

        return res.status(200).json({

            success: true,

            message: "Notification deleted successfully."

        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to delete notification.",

            error: error.message

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};




/**
 * Get My Notifications
 */
exports.getMyNotifications = async (req, res) => {

    try {

        const recipientId = req.user.id;

        const notifications =
            await recipientModel.getMyNotifications(recipientId);

        return res.status(200).json({

            success: true,

            count: notifications.length,

            data: notifications

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch notifications.",

            error: error.message

        });

    }

};




/**
 * Get Notification Details
 */
exports.getNotificationById = async (req, res) => {

    try {

        const notificationId = req.params.notificationId;

        const recipientId = req.user.id;

        const notification =
            await recipientModel.getNotificationById(

                notificationId,

                recipientId

            );

        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found."

            });

        }

        return res.status(200).json({

            success: true,

            data: notification

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch notification.",

            error: error.message

        });

    }

};