const studentPhaseAllocationModel = require("../models/studentPhaseAllocationModel");

// Add Allocation
exports.addAllocation = async (req, res) => {
    try {

        const {
            student_roll,
            batch_id
        } = req.body;

        await studentPhaseAllocationModel.addAllocation(
            student_roll,
            batch_id
        );

        res.status(201).json({
            success: true,
            message: "Student Phase Allocation Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get All Allocations
exports.getAllAllocations = async (req, res) => {
    try {

        const allocations =
            await studentPhaseAllocationModel.getAllAllocations();

        res.json({
            success: true,
            allocations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Get Allocation By ID
exports.getAllocationById = async (req, res) => {
    try {

        const allocation =
            await studentPhaseAllocationModel.getAllocationById(
                req.params.id
            );

        res.json({
            success: true,
            allocation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Update Allocation
exports.updateAllocation = async (req, res) => {
    try {

        const {
            student_roll,
            batch_id
        } = req.body;

        await studentPhaseAllocationModel.updateAllocation(
            req.params.id,
            student_roll,
            batch_id
        );

        res.json({
            success: true,
            message: "Student Phase Allocation Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// Delete Allocation
exports.deleteAllocation = async (req, res) => {
    try {

        await studentPhaseAllocationModel.deleteAllocation(
            req.params.id
        );

        res.json({
            success: true,
            message: "Student Phase Allocation Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};