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
       




for (const recipient of recipients) {

    // Super Admin -> Everyone
    if (senderRole === "SUPER_ADMIN") {
        allowedRecipients.push(recipient);
        continue;
    }

    // Placement Officer -> Students only
    if (
        senderRole === "PLACEMENT_OFFICER" &&
        recipient.recipient_type === "ROLE" &&
        recipient.role === "STUDENT"
    ) {
        allowedRecipients.push(recipient);
        continue;
    }

    // HOD -> Students of own department
    if (
        senderRole === "HOD" &&
        recipient.recipient_type === "ROLE" &&
        recipient.role === "STUDENT"
    ) {
        allowedRecipients.push(recipient);
        continue;
    }

    // Faculty -> Own students only
    if (
        senderRole === "FACULTY" &&
        recipient.recipient_type === "ROLE" &&
        recipient.role === "STUDENT"
    ) {
        allowedRecipients.push(recipient);
    }

}

if (allowedRecipients.length === 0) {

    await connection.rollback();

    return res.status(403).json({
        success: false,
        message: "You are not allowed to send notification to selected recipients."
    });

}

/* ---------------- Save Notification Recipients ---------------- */


for (const recipient of recipients) {

    if (senderRole === "SUPER_ADMIN") {
        allowedRecipients.push(recipient);
    }


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