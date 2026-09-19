const phaseBatchModel = require("../models/phaseBatchModel");
const trainingPhaseModel = require("../models/trainingPhaseModel");

// Add / Create Batch
exports.createBatch = async (req, res) => {
    try {
        const { phase_id, batch_name, description, trainer_name, room_no } = req.body;

        if (!phase_id) {
            return res.status(400).json({
                success: false,
                message: "Target training phase ID is required."
            });
        }

        if (!batch_name || !batch_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Batch name is required."
            });
        }

        // Validate that referenced training phase exists
        const phase = await trainingPhaseModel.getPhaseById(phase_id);
        if (!phase) {
            return res.status(404).json({
                success: false,
                message: `Referenced training phase with ID ${phase_id} does not exist.`
            });
        }

        const result = await phaseBatchModel.addBatch(
            phase_id,
            batch_name.trim(),
            description || '',
            trainer_name || '',
            room_no || ''
        );

        return res.status(201).json({
            success: true,
            message: "Phase Batch Created Successfully",
            batch_id: result.insertId
        });
    } catch (err) {
        console.error("Error creating phase batch:", err);
        return res.status(500).json({
            success: false,
            message: "Server error creating phase batch.",
            error: err.message
        });
    }
};
exports.addBatch = exports.createBatch;

// Get All Batches
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await phaseBatchModel.getAllBatches();
        return res.status(200).json({
            success: true,
            batches
        });
    } catch (err) {
        console.error("Error getting batches:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching batches.",
            error: err.message
        });
    }
};

// Get Batches by Phase
exports.getBatchesByPhase = async (req, res) => {
    try {
        const { phaseId } = req.params;
        const batches = await phaseBatchModel.getBatchesByPhase(phaseId);
        return res.status(200).json({
            success: true,
            batches
        });
    } catch (err) {
        console.error("Error getting batches by phase:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching batches for this phase.",
            error: err.message
        });
    }
};

// Get Batch By ID
exports.getBatchById = async (req, res) => {
    try {
        const batch = await phaseBatchModel.getBatchById(req.params.id);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Phase batch not found."
            });
        }
        return res.status(200).json({
            success: true,
            batch
        });
    } catch (err) {
        console.error("Error getting batch by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching phase batch.",
            error: err.message
        });
    }
};

// Update Batch
exports.updateBatch = async (req, res) => {
    try {
        const { phase_id, batch_name, description, trainer_name, room_no } = req.body;

        const existing = await phaseBatchModel.getBatchById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Phase batch not found."
            });
        }

        if (phase_id) {
            const phase = await trainingPhaseModel.getPhaseById(phase_id);
            if (!phase) {
                return res.status(404).json({
                    success: false,
                    message: `Target training phase with ID ${phase_id} does not exist.`
                });
            }
        }

        await phaseBatchModel.updateBatch(
            req.params.id,
            phase_id,
            batch_name,
            description,
            trainer_name,
            room_no
        );

        return res.status(200).json({
            success: true,
            message: "Phase Batch Updated Successfully"
        });
    } catch (err) {
        console.error("Error updating batch:", err);
        return res.status(500).json({
            success: false,
            message: "Server error updating phase batch.",
            error: err.message
        });
    }
};

// Delete Batch
exports.deleteBatch = async (req, res) => {
    try {
        const existing = await phaseBatchModel.getBatchById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Phase batch not found."
            });
        }

        await phaseBatchModel.deleteBatch(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Phase Batch Deleted Successfully"
        });
    } catch (err) {
        console.error("Error deleting batch:", err);
        return res.status(500).json({
            success: false,
            message: "Server error deleting phase batch.",
            error: err.message
        });
    }
};