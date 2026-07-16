const auditModel = require("../models/notificationAuditModel");

/**
 * Get Audit Logs
 */
exports.getAuditLogs = async (req, res) => {

    try {

        const notificationId = req.params.notificationId;

        const logs = await auditModel.getAuditLogs(notificationId);

        return res.status(200).json({

            success: true,

            count: logs.length,

            data: logs

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch audit logs.",

            error: error.message

        });

    }

};