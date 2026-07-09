const announcementModel = require("../models/announcementModel");

// Add Announcement
exports.addAnnouncement = async (req, res) => {
    try {

        const {
            target_type,
            target_batch_id,
            title,
            message
        } = req.body;

        await announcementModel.addAnnouncement(
            req.user.id,
            target_type,
            target_batch_id,
            title,
            message
        );

        res.status(201).json({
            success: true,
            message: "Announcement Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Announcements
exports.getAllAnnouncements = async (req, res) => {
    try {

        const announcements =
            await announcementModel.getAllAnnouncements();

        res.json({
            success: true,
            announcements
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Announcement By ID
exports.getAnnouncementById = async (req, res) => {
    try {

        const announcement =
            await announcementModel.getAnnouncementById(
                req.params.id
            );

        res.json({
            success: true,
            announcement
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Announcement
exports.updateAnnouncement = async (req, res) => {
    try {

        const {
            target_type,
            target_batch_id,
            title,
            message
        } = req.body;

        await announcementModel.updateAnnouncement(
            req.params.id,
            target_type,
            target_batch_id,
            title,
            message
        );

        res.json({
            success: true,
            message: "Announcement Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
    try {

        await announcementModel.deleteAnnouncement(
            req.params.id
        );

        res.json({
            success: true,
            message: "Announcement Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};