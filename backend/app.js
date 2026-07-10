const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser"); 

// ==========================
// Route Imports
// ==========================
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const placementOfficerRoutes = require("./routes/placementOfficerRoutes");
const placementCoordinatorRoutes = require("./routes/placementCoordinatorRoutes");
const placementHeadRoutes = require("./routes/placementHeadRoutes");
const trainingHeadRoutes = require("./routes/trainingHeadRoutes");
const hodRoutes = require("./routes/hodRoutes");
const managementRoutes = require("./routes/managementRoutes");
const companyRoutes = require("./routes/companyRoutes");
const placementDriveRoutes = require("./routes/placementDriveRoutes");
const placementApplicationRoutes = require("./routes/placementApplicationRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const studentSkillRoutes = require("./routes/studentSkillRoutes");
const studentProjectRoutes = require("./routes/studentProjectRoutes");
const studentCertificationRoutes = require("./routes/studentCertificationRoutes");
const offerRoutes = require("./routes/offerRoutes");
const trainingPhaseRoutes = require("./routes/trainingPhaseRoutes");
const phaseBatchRoutes = require("./routes/phaseBatchRoutes");
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const systemPermissionRoutes = require("./routes/systemPermissionRoutes");
const managementProfileRoutes = require("./routes/managementProfileRoutes");
const placementTeamProfileRoutes = require("./routes/placementTeamProfileRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const jobPostingRoutes = require("./routes/jobPostingRoutes");
const notificationLogRoutes = require("./routes/notificationLogRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const studentPhaseAllocationRoutes = require("./routes/studentPhaseAllocationRoutes");
const rolePermissionMappingRoutes = require("./routes/rolePermissionMappingRoutes");

// ==========================
// Express App
// ==========================
const app = express();

// ==========================
// Middleware (UPDATED FOR PRODUCTION STANDARDS)
// ==========================
app.use(cors({
    origin: "http://localhost:3000", // Explicitly trust your React local port
    credentials: true,                // Crucial: Allows backend to read/write HttpOnly session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());            // Crucial: Automatically parses incoming cookie data for req.cookies
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
    res.send("TP Portal Backend Running...");
});

// ==========================
// Authentication
// ==========================
app.use("/api/auth", authRoutes);

// ==========================
// User Modules
// ==========================
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/placement-officer", placementOfficerRoutes);
app.use("/api/placement-coordinator", placementCoordinatorRoutes);
app.use("/api/placement-head", placementHeadRoutes);
app.use("/api/training-head", trainingHeadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notification-logs", notificationLogRoutes);
app.use("/api/job-postings", jobPostingRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/placement-team-profiles", placementTeamProfileRoutes);
app.use("/api/management-profiles", managementProfileRoutes);
// ==========================
// Placement Modules
// ==========================
app.use("/api/companies", companyRoutes);
app.use("/api/placement-drives", placementDriveRoutes);
app.use("/api/placement-applications", placementApplicationRoutes);
app.use("/api/offers", offerRoutes);

// ==========================
// Student Modules
// ==========================
app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/student-skills", studentSkillRoutes);
app.use("/api/student-projects", studentProjectRoutes);
app.use("/api/student-certifications", studentCertificationRoutes);
app.use("/api/role-permissions", rolePermissionMappingRoutes);

// ==========================
// Training Modules
// ==========================
app.use("/api/training-phases", trainingPhaseRoutes);
app.use("/api/phase-batches", phaseBatchRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/system-permissions", systemPermissionRoutes);

// ==========================
// Export App
// ==========================
app.use("/api/student-phase-allocations", studentPhaseAllocationRoutes);
module.exports = app;