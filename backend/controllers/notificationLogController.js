const notificationLogModel = require("../models/notificationLogModel");

// Add Notification
exports.addNotification = async (req, res) => {
    try {

        const {
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        } = req.body;

        await notificationLogModel.addNotification(
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        );

        res.status(201).json({
            success: true,
            message: "Notification Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Notifications
exports.getAllNotifications = async (req, res) => {
    try {

        const notifications =
            await notificationLogModel.getAllNotifications();

        res.json({
            success: true,
            notifications
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Notification By ID
exports.getNotificationById = async (req, res) => {
    try {

        const notification =
            await notificationLogModel.getNotificationById(
                req.params.id
            );

        res.json({
            success: true,
            notification
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Notification
exports.updateNotification = async (req, res) => {
    try {

        const {
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        } = req.body;

        await notificationLogModel.updateNotification(
            req.params.id,
            student_roll,
            notification_type,
            recipient_mobile,
            delivery_status
        );

        res.json({
            success: true,
            message: "Notification Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
    try {

        await notificationLogModel.deleteNotification(
            req.params.id
        );

        res.json({
            success: true,
            message: "Notification Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};