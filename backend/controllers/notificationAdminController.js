const db = require("../config/db");

const notificationModel = require("../models/notificationModel");
const auditModel = require("../models/notificationAuditModel");

/**
 * Get All Notifications (Admin)
 */
exports.getAllNotifications = async (req, res) => {

    try {

        const notifications =
            await notificationModel.getAllNotifications();

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
 * Delete Notification (Admin)
 */
exports.deleteNotification = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const notificationId = req.params.notificationId;

        const adminId = req.user.id;

        const adminRole = req.user.role;

        const notification =
            await notificationModel.getNotificationById(

                notificationId

            );

        if (!notification) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message: "Notification not found."

            });

        }

        await notificationModel.deleteNotification(

            connection,

            notificationId

        );



                // Audit Log
        await auditModel.createAuditLog(connection, {

            notification_id: notificationId,

            action: "DELETED",

            action_by: adminId,

            action_role: adminRole,

            remarks: "Notification deleted by admin"

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
 * Get Notification Statistics (Admin)
 */
exports.getNotificationStats = async (req, res) => {

    try {

        const stats =
            await notificationModel.getNotificationStats();

        return res.status(200).json({

            success: true,

            data: stats

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch notification statistics.",

            error: error.message

        });

    }

};




/**
 * Get Notification Details (Admin)
 */
exports.getNotificationById = async (req, res) => {

    try {

        const notificationId = req.params.notificationId;

        const notification =
            await notificationModel.getNotificationById(
                notificationId
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