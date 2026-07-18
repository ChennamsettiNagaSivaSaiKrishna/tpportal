const db = require("../config/db");

const notificationModel = require("../models/notificationModel");
const recipientModel = require("../models/notificationRecipientModel");
const attachmentModel = require("../models/notificationAttachmentModel");
const auditModel = require("../models/notificationAuditModel");

/**
 * Create Notification
 */
exports.createNotification = async (req, res) => {

console.log(req.body);
    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const {

            title,
            message,
            category,
            priority,
            recipients

        } = req.body;


        const allowedPriorities = [
    "NORMAL",
    "IMPORTANT",
    "URGENT"
];

if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
        success: false,
        message: "Invalid priority."
    });
}

        const senderId = req.user.id;
        const senderRole = req.user.role;

        /* ---------------- Validation ---------------- */

        if (!title || !message) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Title and Message are required."
            });

        }

        if (!Array.isArray(recipients) || recipients.length === 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Please select at least one recipient."
            });

        }

        /* ---------------- Notification Object ---------------- */

        const notificationData = {

            title: title.trim(),

            message: message.trim(),

            category: category || "GENERAL",

            priority: priority || "NORMAL",

            sender_id: senderId,

            sender_role: senderRole,

            attachment_count: req.files ? req.files.length : 0

        };

        /* ---------------- Save Notification ---------------- */

        const notificationId =
            await notificationModel.createNotification(
                connection,
                notificationData
            );

        /* ---------------- Audit Log ---------------- */

        await auditModel.createAuditLog(connection, {

            notification_id: notificationId,

            action: "CREATED",

            action_by: senderId,

            action_role: senderRole,

            remarks: "Notification Created"

        });

        // =====================================================
        // PART 2 STARTS HERE
        // 1. Validate recipient permissions
        // 2. Filter recipients based on role rules
        // 3. Insert notification_recipients
        // 4. Upload attachments
        // 5. Update attachment_count
        // 6. Commit transaction
        // =====================================================





        /* ---------------- Validate Recipient Permissions ---------------- */


const allowedRecipients = recipients;

if (allowedRecipients.length === 0) {

    await connection.rollback();

    return res.status(403).json({
        success: false,
        message: "No recipients selected."
    });

}

/* ---------------- Save Notification Recipients ---------------- */

console.log("Allowed Recipients:", allowedRecipients);

for (const recipientId of allowedRecipients) {

    console.log("Saving recipient:", recipientId);

    await recipientModel.addRecipient(
        connection,
        notificationId,
        recipientId,
        "student"
    );

}

            /* ---------------- Upload Attachments ---------------- */

        if (req.files && req.files.length > 0) {

            for (const file of req.files) {

                await attachmentModel.createAttachment(connection, {

                    notification_id: notificationId,

                    file_name: file.originalname,

                    file_path: file.path,

                    file_type: file.mimetype,

                    file_size: file.size

                });

            }

        }    




                /* ---------------- Update Attachment Count ---------------- */

        await notificationModel.updateAttachmentCount(

            connection,

            notificationId,

            req.files ? req.files.length : 0

        );




        /* ---------------- Commit Transaction ---------------- */

        await connection.commit();

        return res.status(201).json({

            success: true,

            message: "Notification created successfully.",

            notificationId

        });
        } catch (error) {

    if (connection) {

        await connection.rollback();

    }

    console.error(error);

    return res.status(500).json({

        success: false,

        message: "Failed to create notification.",

        error: error.message

    });

} finally {

    if (connection) {

        connection.release();

    }

}
};

/**
 * Get Sent Notifications
 */
exports.getSentNotifications = async (req, res) => {

    try {

        const senderId = req.user.id;

        const notifications =
            await notificationModel.getSentNotifications(senderId);

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sent notifications.",
            error: error.message
        });

    }

};



/**
 * Update Notification
 */
exports.updateNotification = async (req, res) => {

    try {

        const { notificationId } = req.params;

        const senderId = req.user.id;

        const { title, message, category, priority } = req.body;

        const notification = await notificationModel.getNotificationBySender(
            notificationId,
            senderId
        );

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });

        }

        const createdTime = new Date(notification.created_at).getTime();

        const currentTime = Date.now();

        const diffMinutes = (currentTime - createdTime) / (1000 * 60);
        console.log("Created At:", notification.created_at);
console.log("Current Time:", new Date());
console.log("Difference (minutes):", diffMinutes);

        if (req.user.role !== "admin" && diffMinutes > 15) {

            return res.status(403).json({
                success: false,
                message: "You can edit a notification only within 15 minutes."
            });

        }

        await notificationModel.updateNotification(
            notificationId,
            {
                title,
                message,
                category,
                priority
            }
        );

        return res.status(200).json({
            success: true,
            message: "Notification updated successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification.",
            error: error.message
        });

    }

};



/**
 * Delete Notification (1 Hour Rule)
 */
exports.deleteNotification = async (req, res) => {

    try {

        const { notificationId } = req.params;

        const senderId = req.user.id;

        const notification = await notificationModel.getNotificationBySender(
            notificationId,
            senderId
        );

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });

        }

        const createdTime = new Date(notification.created_at).getTime();

        const currentTime = Date.now();

        const diffMinutes = (currentTime - createdTime) / (1000 * 60);

        if (req.user.role !== "admin" && diffMinutes > 60) {

            return res.status(403).json({
                success: false,
                message: "You can delete a notification only within 1 hour."
            });

        }

        await notificationModel.softDeleteNotification(notificationId);
        await recipientModel.softDeleteRecipients(notificationId);

        const row = await db.query(
    "SELECT notification_id, is_deleted, deleted_at FROM notification_recipients WHERE notification_id = ?",
    [notificationId]
);

console.log(row);

        return res.status(200).json({

            success: true,

            message: "Notification deleted successfully."

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to delete notification.",

            error: error.message

        });

    }

};