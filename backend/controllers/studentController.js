const studentModel = require("../models/studentModel");
const userModel = require("../models/userModel");

// Test Route
exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Student Controller Working"
    });
};

// Get Student Profile
exports.profile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const student = await studentModel.getStudentProfileById(userId);

        if (!student) {
            return res.status(200).json({
                success: true,
                profile: {
                    fullName: "",
                    email: req.user.email,
                    rollNumber: "",
                    branch: "", // Triggers the React form onboarding lock cleanly
                    cgpa: 0.00,
                    phoneNumber: "",
                    verificationStatus: "Pending Profile Creation"
                }
            });
        }

        return res.status(200).json({
            success: true,
            profile: {
                fullName: student.full_name,
                email: student.email,
                rollNumber: student.roll_number,
                branch: student.dept_name || "General Stream",
                cgpa: parseFloat(student.cgpa),
                phoneNumber: student.mobile,
                // Maps your ENUM choices straight to your styled frontend badges
                verificationStatus: student.verification_status === "verified" 
                    ? "Clearance Verified" 
                    : "Verification Pending"
            }
        });

    } catch (error) {
        console.error("Profile endpoint error:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
    try {
        const { full_name, mobile, cgpa, active_backlogs, roll_number, department_id } = req.body;

        await studentModel.updateStudentProfile(
            req.user.id,
            full_name,
            mobile,
            cgpa,
            active_backlogs,
            roll_number,
            department_id
        );

        res.json({ success: true, message: "Profile updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Add this new endpoint controller method to pass departments list to frontend
exports.getDepartmentsList = async (req, res) => {
    try {
        const departments = await studentModel.getAllDepartments();
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch departments" });
    }
};
// Upload Resume
exports.uploadResume = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF resume"
            });
        }

        res.json({
            success: true,
            message: "Resume Uploaded Successfully",
            file: req.file.filename
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// Add Skill
exports.addSkill = async (req, res) => {
    try {

        const { skill_name } = req.body;

        await studentModel.addSkill(req.user.id, skill_name);

        res.json({
            success: true,
            message: "Skill Added Successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// View Skills
exports.getSkills = async (req, res) => {
    try {

        const skills = await studentModel.getSkills(req.user.id);

        res.json({
            success: true,
            skills
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Skill
exports.updateSkill = async (req, res) => {
    try {
        const { skill_name } = req.body;

        await studentModel.updateSkill(req.params.id, skill_name);

        res.json({
            success: true,
            message: "Skill Updated Successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
    try {
        await studentModel.deleteSkill(req.params.id);

        res.json({
            success: true,
            message: "Skill Deleted Successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.profile = async (req, res) => {
    try {
        const userId = req.user.id; 

        // 1. Fetch the absolute baseline account row to get the verified email address string
        const baseAccount = await userModel.findById(userId); // Or: await db.query("SELECT email FROM users WHERE id = ?", [userId])
        const userEmail = baseAccount?.email || "Email Pending Sync...";

        // 2. Look up the extended placement profile details row
        const student = await studentModel.getStudentProfileById(userId);

        // CASE A: If the student profile table row does not exist yet (First Visit Onboarding Phase)
        if (!student) {
            return res.status(200).json({
                success: true,
                profile: {
                    fullName: "New Student Workspace",
                    email: userEmail, // 💡 Displaying your authentic user login email right away!
                    rollNumber: "",
                    branch: "", 
                    cgpa: 0.00,
                    phoneNumber: "",
                    verificationStatus: "Pending Profile Creation" // Custom status token
                }
            });
        }

        // CASE B: Extended row exists, check its active verification audit column parameters
        return res.status(200).json({
            success: true,
            profile: {
                fullName: student.full_name,
                email: student.email || userEmail, // Fallback safety layer
                rollNumber: student.roll_number,
                branch: student.dept_name || student.branch || "",
                cgpa: student.cgpa ? parseFloat(student.cgpa) : 0.00,
                phoneNumber: student.mobile || student.phone_number || "",
                // 💡 Checking if the administrator has checked the verification box
                verificationStatus: student.is_verified === 1 || student.is_verified === true 
                    ? "Clearance Verified" 
                    : "Verification Pending"
            }
        });

    } catch (error) {
        console.error("Profile payload sync resolution fault:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
exports.getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await studentModel.getDashboardMetrics(req.user.id);
        console.log(metrics,"---------->metrics")
        return res.status(200).json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};