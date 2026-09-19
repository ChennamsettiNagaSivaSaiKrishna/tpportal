const trainingPhaseModel = require("../models/trainingPhaseModel");

// Create / Add Phase
exports.createPhase = async (req, res) => {
    try {
        const { phase_name, academic_year, description, is_active, start_date, end_date, status } = req.body;

        if (!phase_name || !phase_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Training phase name is required."
            });
        }

        const result = await trainingPhaseModel.addPhase(
            phase_name.trim(),
            academic_year || '2025-2026',
            description || '',
            is_active !== undefined ? is_active : 1,
            start_date || null,
            end_date || null,
            status || 'active'
        );

        return res.status(201).json({
            success: true,
            message: "Training Phase Created Successfully",
            phase_id: result.insertId
        });
    } catch (err) {
        console.error("Error creating training phase:", err);
        return res.status(500).json({
            success: false,
            message: "Server error creating training phase.",
            error: err.message
        });
    }
};
exports.addPhase = exports.createPhase;

// Get All Phases
exports.getAllPhases = async (req, res) => {
    try {
        const phases = await trainingPhaseModel.getAllPhases();
        return res.status(200).json({
            success: true,
            phases
        });
    } catch (err) {
        console.error("Error getting training phases:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching training phases.",
            error: err.message
        });
    }
};

// Get Phase By ID
exports.getPhaseById = async (req, res) => {
    try {
        const phase = await trainingPhaseModel.getPhaseById(req.params.id);
        if (!phase) {
            return res.status(404).json({
                success: false,
                message: "Training phase not found."
            });
        }
        return res.status(200).json({
            success: true,
            phase
        });
    } catch (err) {
        console.error("Error fetching phase by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching training phase.",
            error: err.message
        });
    }
};

// Update Phase
exports.updatePhase = async (req, res) => {
    try {
        const { phase_name, academic_year, description, is_active, start_date, end_date, status } = req.body;
        
        // Verify phase exists
        const existing = await trainingPhaseModel.getPhaseById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Training phase not found."
            });
        }

        await trainingPhaseModel.updatePhase(
            req.params.id,
            phase_name,
            academic_year,
            description,
            is_active,
            start_date,
            end_date,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Training Phase Updated Successfully"
        });
    } catch (err) {
        console.error("Error updating phase:", err);
        return res.status(500).json({
            success: false,
            message: "Server error updating training phase.",
            error: err.message
        });
    }
};

// Delete Phase
exports.deletePhase = async (req, res) => {
    try {
        const existing = await trainingPhaseModel.getPhaseById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Training phase not found."
            });
        }

        await trainingPhaseModel.deletePhase(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Training Phase Deleted Successfully"
        });
    } catch (err) {
        console.error("Error deleting phase:", err);
        return res.status(500).json({
            success: false,
            message: "Server error deleting training phase.",
            error: err.message
        });
    }
};