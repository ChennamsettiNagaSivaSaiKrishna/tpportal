const attendanceModel = require("../models/attendanceModel");

// Add Attendance
exports.addAttendance = async (req, res) => {
    try {

        const {
            student_roll,
            session_id,
            is_present
        } = req.body;

        const marked_by_user_id = req.user.id;

        await attendanceModel.addAttendance(
            student_roll,
            session_id,
            is_present,
            marked_by_user_id
        );

        res.status(201).json({
            success: true,
            message: "Attendance Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Attendance
exports.getAllAttendance = async (req, res) => {
    try {

        const attendance =
            await attendanceModel.getAllAttendance();

        res.json({
            success: true,
            attendance
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Attendance By ID
exports.getAttendanceById = async (req, res) => {
    try {

        const attendance =
            await attendanceModel.getAttendanceById(
                req.params.id
            );

        res.json({
            success: true,
            attendance
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Attendance
exports.updateAttendance = async (req, res) => {
    try {

        const {
            student_roll,
            session_id,
            is_present
        } = req.body;

        const marked_by_user_id = req.user.id;

        await attendanceModel.updateAttendance(
            req.params.id,
            student_roll,
            session_id,
            is_present,
            marked_by_user_id
        );

        res.json({
            success: true,
            message: "Attendance Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Attendance
exports.deleteAttendance = async (req, res) => {
    try {

        await attendanceModel.deleteAttendance(
            req.params.id
        );

        res.json({
            success: true,
            message: "Attendance Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};