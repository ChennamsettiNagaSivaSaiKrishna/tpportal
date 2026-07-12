const db = require("../config/db"); // Adjust pathway based on your database pool utility configuration

exports.getUpcomingHiringDrives = async (req, res) => {
    try {
        // Fetch all drive schedules sorted by date order
        const [drives] = await db.query(
            `SELECT id, company_name, role_name, ctc_lpa, min_cgpa, allowed_branches, drive_date, selection_process 
             FROM hiring_drives 
             ORDER BY drive_date ASC`
        );

        return res.status(200).json({
            success: true,
            drives: drives
        });
    } catch (error) {
        console.error("CRITICAL EXCEPTION inside getUpcomingHiringDrives:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to synchronize campus placement drive timelines."
        });
    }
};