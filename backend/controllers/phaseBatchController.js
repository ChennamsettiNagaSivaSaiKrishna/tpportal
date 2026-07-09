const phaseBatchModel = require("../models/phaseBatchModel");

// Add Batch
exports.addBatch = async (req, res) => {
    try {

        const {
            phase_id,
            batch_name,
            description
        } = req.body;

        await phaseBatchModel.addBatch(
            phase_id,
            batch_name,
            description
        );

        res.status(201).json({
            success: true,
            message: "Phase Batch Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Batches
exports.getAllBatches = async (req, res) => {
    try {

        const batches =
            await phaseBatchModel.getAllBatches();

        res.json({
            success: true,
            batches
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Batch By ID
exports.getBatchById = async (req, res) => {
    try {

        const batch =
            await phaseBatchModel.getBatchById(
                req.params.id
            );

        res.json({
            success: true,
            batch
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Batch
exports.updateBatch = async (req, res) => {
    try {

        const {
            phase_id,
            batch_name,
            description
        } = req.body;

        await phaseBatchModel.updateBatch(
            req.params.id,
            phase_id,
            batch_name,
            description
        );

        res.json({
            success: true,
            message: "Phase Batch Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Batch
exports.deleteBatch = async (req, res) => {
    try {

        await phaseBatchModel.deleteBatch(
            req.params.id
        );

        res.json({
            success: true,
            message: "Phase Batch Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};