const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const notificationController = require("../controllers/notificationController");
const notificationRecipientController = require("../controllers/notificationRecipientController");
const notificationAttachmentController = require("../controllers/notificationAttachmentController");
const notificationAdminController = require("../controllers/notificationAdminController");
const notificationAuditController = require("../controllers/notificationAuditController");
const userController = require("../controllers/userController");

/* ================= Notification ================= */

router.post(
    "/",
    verifyToken,
    upload.array("attachments", 10),
    notificationController.createNotification
);

router.get(
    "/sent",
    verifyToken,
    notificationController.getSentNotifications
);

router.put(
    "/:notificationId",
    verifyToken,
    notificationController.updateNotification
);

router.delete(
    "/:notificationId",
    verifyToken,
    notificationController.deleteNotification
);

/* ================= Recipient ================= */

router.get(
    "/my-notifications",
    verifyToken,
    notificationRecipientController.getMyNotifications
);

router.get(
    "/my",
    verifyToken,
    notificationRecipientController.getMyNotifications
);

router.get(
    "/search",
    verifyToken,
    notificationRecipientController.searchMyNotifications
);

router.get(
    "/:notificationId",
    verifyToken,
    notificationRecipientController.getNotificationById
);

router.put(
    "/:notificationId/read",
    verifyToken,
    notificationRecipientController.markAsRead
);

router.delete(
    "/:notificationId/delete",
    verifyToken,
    notificationRecipientController.deleteNotification
);

/* ================= Attachments ================= */

router.get(
    "/:notificationId/attachments",
    verifyToken,
    notificationAttachmentController.getAttachments
);

router.get(
    "/attachment/:attachmentId/download",
    verifyToken,
    notificationAttachmentController.downloadAttachment
);

router.delete(
    "/attachment/:attachmentId",
    verifyToken,
    notificationAttachmentController.deleteAttachment
);

/* ================= Audit ================= */

router.get(
    "/:notificationId/audit",
    verifyToken,
    notificationAuditController.getAuditLogs
);

/* ================= Admin ================= */

router.get(
    "/admin/all",
    verifyToken,
    notificationAdminController.getAllNotifications
);

router.get(
    "/admin/stats",
    verifyToken,
    notificationAdminController.getNotificationStats
);

router.get(
    "/admin/:notificationId",
    verifyToken,
    notificationAdminController.getNotificationById
);

router.delete(
    "/admin/:notificationId",
    verifyToken,
    notificationAdminController.deleteNotification
);

module.exports = router;