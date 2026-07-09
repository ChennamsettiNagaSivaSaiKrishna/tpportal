const trainingPhaseModel = require("../models/trainingPhaseModel");

// Add Phase
exports.addPhase = async (req, res) => {
    try {

        const {
            phase_name,
            academic_year,
            is_active
        } = req.body;

        await trainingPhaseModel.addPhase(
            phase_name,
            academic_year,
            is_active
        );

        res.status(201).json({
            success: true,
            message: "Training Phase Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Phases
exports.getAllPhases = async (req, res) => {
    try {

        const phases =
            await trainingPhaseModel.getAllPhases();

        res.json({
            success: true,
            phases
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Phase By ID
exports.getPhaseById = async (req, res) => {
    try {

        const phase =
            await trainingPhaseModel.getPhaseById(
                req.params.id
            );

        res.json({
            success: true,
            phase
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Phase
exports.updatePhase = async (req, res) => {
    try {

        const {
            phase_name,
            academic_year,
            is_active
        } = req.body;

        await trainingPhaseModel.updatePhase(
            req.params.id,
            phase_name,
            academic_year,
            is_active
        );

        res.json({
            success: true,
            message: "Training Phase Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Phase
exports.deletePhase = async (req, res) => {
    try {

        await trainingPhaseModel.deletePhase(
            req.params.id
        );

        res.json({
            success: true,
            message: "Training Phase Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};