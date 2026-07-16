const db = require("../config/db");

const attachmentModel = require("../models/notificationAttachmentModel");

/**
 * Get Attachments of a Notification
 */
exports.getAttachments = async (req, res) => {

    try {

        const notificationId = req.params.notificationId;

        const attachments =
            await attachmentModel.getAttachmentsByNotification(
                notificationId
            );

        return res.status(200).json({

            success: true,

            count: attachments.length,

            data: attachments

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch attachments.",

            error: error.message

        });

    }

};

/**
 * Download Attachment
 */
exports.downloadAttachment = async (req, res) => {

    try {

        const attachmentId = req.params.attachmentId;

        const attachment =
            await attachmentModel.getAttachmentById(
                attachmentId
            );

        if (!attachment) {

            return res.status(404).json({

                success: false,

                message: "Attachment not found."

            });

        }

        return res.download(

            attachment.file_path,

            attachment.original_file_name

        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to download attachment.",

            error: error.message

        });

    }

};




/**
 * Delete Attachment
 */
exports.deleteAttachment = async (req, res) => {

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const attachmentId = req.params.attachmentId;

        const attachment =
            await attachmentModel.getAttachmentById(
                attachmentId
            );

        if (!attachment) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message: "Attachment not found."

            });

        }

        await attachmentModel.deleteAttachment(

            connection,

            attachmentId

        );

                await connection.commit();

        return res.status(200).json({

            success: true,

            message: "Attachment deleted successfully."

        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to delete attachment.",

            error: error.message

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};