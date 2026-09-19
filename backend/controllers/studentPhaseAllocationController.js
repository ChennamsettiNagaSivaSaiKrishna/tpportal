const studentPhaseAllocationModel = require("../models/studentPhaseAllocationModel");
const phaseBatchModel = require("../models/phaseBatchModel");
const db = require("../config/db");

// Allocate Single Student
exports.createAllocation = async (req, res) => {
    try {
        const { student_roll, batch_id } = req.body;

        if (!student_roll || !String(student_roll).trim()) {
            return res.status(400).json({
                success: false,
                message: "Student roll number is required."
            });
        }

        if (!batch_id) {
            return res.status(400).json({
                success: false,
                message: "Target batch ID is required."
            });
        }

        const cleanRoll = String(student_roll).trim();

        // 1. Verify batch exists
        const batch = await phaseBatchModel.getBatchById(batch_id);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: `Batch with ID ${batch_id} does not exist.`
            });
        }

        // 2. Verify student exists in system
        const [studentRows] = await db.query(
            `SELECT id, roll_number FROM users WHERE roll_number = ?
             UNION
             SELECT id, roll_number FROM student_profiles WHERE roll_number = ?`,
            [cleanRoll, cleanRoll]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Student with roll number '${cleanRoll}' was not found in institutional records.`
            });
        }

        // 3. Prevent duplicate allocation to the same batch
        const existingAllocation = await studentPhaseAllocationModel.findAllocation(cleanRoll, batch_id);
        if (existingAllocation) {
            return res.status(409).json({
                success: false,
                message: `Student '${cleanRoll}' is already allocated to batch '${batch.batch_name}'.`
            });
        }

        // 4. Create allocation
        const result = await studentPhaseAllocationModel.addAllocation(cleanRoll, batch_id);

        return res.status(201).json({
            success: true,
            message: `Student '${cleanRoll}' allocated to batch successfully.`,
            allocation_id: result.insertId
        });
    } catch (err) {
        console.error("Error creating student allocation:", err);
        return res.status(500).json({
            success: false,
            message: "Server error creating student allocation.",
            error: err.message
        });
    }
};
exports.addAllocation = exports.createAllocation;

// Bulk Allocate Students
exports.bulkAllocate = async (req, res) => {
    try {
        const { student_rolls, batch_id } = req.body;

        if (!Array.isArray(student_rolls) || student_rolls.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A non-empty array of student_rolls is required."
            });
        }

        if (!batch_id) {
            return res.status(400).json({
                success: false,
                message: "Target batch ID is required."
            });
        }

        const batch = await phaseBatchModel.getBatchById(batch_id);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: `Batch with ID ${batch_id} does not exist.`
            });
        }

        const { allocatedCount, skippedCount } = await studentPhaseAllocationModel.bulkAllocate(student_rolls, batch_id);

        return res.status(200).json({
            success: true,
            message: `Bulk allocation completed. Allocated: ${allocatedCount}, Skipped duplicates: ${skippedCount}.`,
            allocatedCount,
            skippedCount
        });
    } catch (err) {
        console.error("Error in bulk allocation:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during bulk student allocation.",
            error: err.message
        });
    }
};

// Get All Allocations
exports.getAllAllocations = async (req, res) => {
    try {
        const allocations = await studentPhaseAllocationModel.getAllAllocations();
        return res.status(200).json({
            success: true,
            allocations
        });
    } catch (err) {
        console.error("Error fetching all allocations:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching allocations.",
            error: err.message
        });
    }
};

// Get Allocations by Batch ID
exports.getAllocationsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const allocations = await studentPhaseAllocationModel.getAllocationsByBatch(batchId);
        return res.status(200).json({
            success: true,
            allocations
        });
    } catch (err) {
        console.error("Error fetching batch allocations:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching allocations for this batch.",
            error: err.message
        });
    }
};

// Get Available Students For Batch Allocation
exports.getAvailableStudents = async (req, res) => {
    try {
        const { batch_id, search } = req.query;
        if (!batch_id) {
            return res.status(400).json({
                success: false,
                message: "Query parameter 'batch_id' is required."
            });
        }
        const students = await studentPhaseAllocationModel.getAvailableStudentsForBatch(batch_id, search || '');
        return res.status(200).json({
            success: true,
            students
        });
    } catch (err) {
        console.error("Error fetching available students:", err);
        return res.status(500).json({
            success: false,
            message: "Server error searching available students.",
            error: err.message
        });
    }
};

// Get Allocation by ID
exports.getAllocationById = async (req, res) => {
    try {
        const allocation = await studentPhaseAllocationModel.getAllocationById(req.params.id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: "Allocation record not found."
            });
        }
        return res.status(200).json({
            success: true,
            allocation
        });
    } catch (err) {
        console.error("Error fetching allocation by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching allocation record.",
            error: err.message
        });
    }
};

// Update Allocation
exports.updateAllocation = async (req, res) => {
    try {
        const { student_roll, batch_id } = req.body;

        const existing = await studentPhaseAllocationModel.getAllocationById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Allocation record not found."
            });
        }

        await studentPhaseAllocationModel.updateAllocation(req.params.id, student_roll, batch_id);
        return res.status(200).json({
            success: true,
            message: "Student Phase Allocation Updated Successfully"
        });
    } catch (err) {
        console.error("Error updating allocation:", err);
        return res.status(500).json({
            success: false,
            message: "Server error updating allocation.",
            error: err.message
        });
    }
};

// Delete Allocation
exports.deleteAllocation = async (req, res) => {
    try {
        const existing = await studentPhaseAllocationModel.getAllocationById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Allocation record not found."
            });
        }

        await studentPhaseAllocationModel.deleteAllocation(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Student Phase Allocation Removed Successfully"
        });
    } catch (err) {
        console.error("Error deleting allocation:", err);
        return res.status(500).json({
            success: false,
            message: "Server error removing student allocation.",
            error: err.message
        });
    }
};