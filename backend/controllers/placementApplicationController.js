const placementApplicationModel = require("../models/placementApplicationModel");

// Student Apply
exports.applyDrive = async (req, res) => {
    try {

        const { drive_id, student_roll } = req.body;

        await placementApplicationModel.applyDrive(
            drive_id,
            student_roll
        );

        res.status(201).json({
            success: true,
            message: "Applied Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Student Applications
exports.getStudentApplications = async (req, res) => {
    try {

        const applications =
            await placementApplicationModel.getStudentApplications(
                req.params.student_roll
            );

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Placement Officer - View All Applications
exports.getAllApplications = async (req, res) => {
    try {

        const applications =
            await placementApplicationModel.getAllApplications();

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Application Status
exports.updateApplicationStatus = async (req, res) => {
    try {

        const { current_status } = req.body;

        await placementApplicationModel.updateStatus(
            req.params.id,
            current_status
        );

        res.json({
            success: true,
            message: "Application Status Updated"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};