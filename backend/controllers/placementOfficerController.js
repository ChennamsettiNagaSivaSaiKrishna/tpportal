const placementOfficerModel = require("../models/placementOfficerModel");
const studentModel = require("../models/studentModel");

// Test
exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Placement Officer Controller Working"
    });
};

// View Placement Drives
exports.getAllDrives = async (req, res) => {
    try {
        const drives = await placementOfficerModel.getAllDrives();

        res.json({
            success: true,
            drives
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Apply for Placement Drive
exports.applyDrive = async (req, res) => {
    try {

        const student = await studentModel.getStudentProfile(req.user.id);

        await placementOfficerModel.applyDrive(
            req.params.driveId,
            student.roll_number
        );

        res.json({
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