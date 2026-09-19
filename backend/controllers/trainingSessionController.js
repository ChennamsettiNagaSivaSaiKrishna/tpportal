const trainingSessionModel = require("../models/trainingSessionModel");
const phaseBatchModel = require("../models/phaseBatchModel");

// Create / Add Training Session
exports.createSession = async (req, res) => {
    try {
        const { batch_id, session_date, slot, session_slot, trainer_name, topic, trainer_subject } = req.body;

        if (!batch_id) {
            return res.status(400).json({
                success: false,
                message: "Target batch ID is required."
            });
        }

        if (!session_date) {
            return res.status(400).json({
                success: false,
                message: "Session date is required."
            });
        }

        // Validate batch exists
        const batch = await phaseBatchModel.getBatchById(batch_id);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: `Target batch with ID ${batch_id} was not found.`
            });
        }

        const resolvedSlot = session_slot || slot || 'Morning_S1';
        const resolvedTopic = topic || trainer_subject || 'Scheduled Training Session';
        const markedByUserId = req.user?.id || null;

        const result = await trainingSessionModel.addSession(
            batch_id,
            session_date,
            resolvedSlot,
            trainer_name || batch.trainer_name || '',
            resolvedTopic,
            markedByUserId
        );

        return res.status(201).json({
            success: true,
            message: "Training Session Scheduled Successfully",
            session_id: result.insertId
        });
    } catch (error) {
        console.error("Error creating training session:", error);
        return res.status(500).json({
            success: false,
            message: "Server error scheduling training session.",
            error: error.message
        });
    }
};
exports.addSession = exports.createSession;

// Get All Sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await trainingSessionModel.getAllSessions();
        return res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching training sessions.",
            error: error.message
        });
    }
};

// Get Sessions by Batch ID
exports.getSessionsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const sessions = await trainingSessionModel.getSessionsByBatch(batchId);
        return res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("Error fetching sessions by batch:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching sessions for batch.",
            error: error.message
        });
    }
};

// Get Session By ID
exports.getSessionById = async (req, res) => {
    try {
        const session = await trainingSessionModel.getSessionById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Training session not found."
            });
        }
        return res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error("Error fetching session by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching training session.",
            error: error.message
        });
    }
};

// Update Session
exports.updateSession = async (req, res) => {
    try {
        const { batch_id, session_date, slot, session_slot, trainer_name, topic, trainer_subject, attendance_locked } = req.body;

        const existing = await trainingSessionModel.getSessionById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Training session not found."
            });
        }

        if (batch_id) {
            const batch = await phaseBatchModel.getBatchById(batch_id);
            if (!batch) {
                return res.status(404).json({
                    success: false,
                    message: `Target batch with ID ${batch_id} does not exist.`
                });
            }
        }

        const resolvedSlot = session_slot !== undefined ? session_slot : slot;
        const resolvedTopic = topic !== undefined ? topic : trainer_subject;

        await trainingSessionModel.updateSession(
            req.params.id,
            batch_id,
            session_date,
            resolvedSlot,
            trainer_name,
            resolvedTopic,
            attendance_locked !== undefined ? (attendance_locked ? 1 : 0) : null
        );

        return res.status(200).json({
            success: true,
            message: "Training Session Updated Successfully"
        });
    } catch (error) {
        console.error("Error updating session:", error);
        return res.status(500).json({
            success: false,
            message: "Server error updating training session.",
            error: error.message
        });
    }
};

// Delete Session
exports.deleteSession = async (req, res) => {
    try {
        const existing = await trainingSessionModel.getSessionById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Training session not found."
            });
        }

        await trainingSessionModel.deleteSession(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Training Session Deleted Successfully"
        });
    } catch (error) {
        console.error("Error deleting session:", error);
        return res.status(500).json({
            success: false,
            message: "Server error deleting training session.",
            error: error.message
        });
    }
};