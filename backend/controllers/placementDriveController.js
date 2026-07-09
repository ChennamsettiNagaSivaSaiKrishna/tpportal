const placementDriveModel = require("../models/placementDriveModel");

// ======================================
// Create Placement Drive
// ======================================
exports.createDrive = async (req, res) => {

    try {

        const {
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed
        } = req.body;

        if (
            !company_id ||
            !job_role ||
            !drive_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        await placementDriveModel.createDrive(
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed
        );

        res.status(201).json({
            success: true,
            message: "Placement Drive Created Successfully"
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
// Get All Drives
// ======================================
exports.getAllDrives = async (req, res) => {

    try {

        const drives = await placementDriveModel.getAllDrives();

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

// ======================================
// Get Drive By ID
// ======================================
exports.getDriveById = async (req, res) => {

    try {

        const drive = await placementDriveModel.getDriveById(req.params.id);

        if (!drive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found"
            });

        }

        res.json({
            success: true,
            drive
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
// Update Placement Drive
// ======================================
exports.updateDrive = async (req, res) => {

    try {

        const {
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed,
            status
        } = req.body;

        await placementDriveModel.updateDrive(
            req.params.id,
            company_id,
            job_role,
            drive_date,
            min_cgpa_cutoff,
            max_backlogs_allowed,
            status
        );

        res.json({
            success: true,
            message: "Placement Drive Updated Successfully"
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
// Delete Placement Drive
// ======================================
exports.deleteDrive = async (req, res) => {

    try {

        await placementDriveModel.deleteDrive(req.params.id);

        res.json({
            success: true,
            message: "Placement Drive Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};