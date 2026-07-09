const trainingSessionModel = require("../models/trainingSessionModel");

// ======================================
// Add Training Session
// ======================================
exports.addSession = async (req, res) => {
    try {

        const {
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        } = req.body;

        await trainingSessionModel.addSession(
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        );

        res.status(201).json({
            success: true,
            message: "Training Session Added Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get All Sessions
// ======================================
exports.getAllSessions = async (req, res) => {
    try {

        const sessions =
            await trainingSessionModel.getAllSessions();

        res.json({
            success: true,
            sessions
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get Session By ID
// ======================================
exports.getSessionById = async (req, res) => {
    try {

        const session =
            await trainingSessionModel.getSessionById(req.params.id);

        res.json({
            success: true,
            session
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Update Training Session
// ======================================
exports.updateSession = async (req, res) => {
    try {

        const {
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        } = req.body;

        await trainingSessionModel.updateSession(
            req.params.id,
            batch_id,
            session_date,
            slot,
            trainer_name,
            trainer_subject
        );

        res.json({
            success: true,
            message: "Training Session Updated Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Delete Training Session
// ======================================
exports.deleteSession = async (req, res) => {
    try {

        await trainingSessionModel.deleteSession(req.params.id);

        res.json({
            success: true,
            message: "Training Session Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};