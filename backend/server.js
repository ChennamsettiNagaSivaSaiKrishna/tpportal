const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// ==========================
// Route Imports
// ==========================
const authRbacRoutes = require("./routes/authRbacRoutes");
const adminRbacRoutes = require("./routes/adminRbacRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminRbacManagementRoutes = require("./routes/adminRoutes"); // Dynamic Roles, Groups & Permissions RBAC Admin Routes
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const placementOfficerRoutes = require("./routes/placementOfficerRoutes");
const placementCoordinatorRoutes = require("./routes/placementCoordinatorRoutes");
const placementHeadRoutes = require("./routes/placementHeadRoutes");
const trainingHeadRoutes = require("./routes/trainingHeadRoutes");
const hodRoutes = require("./routes/hodRoutes");
const managementRoutes = require("./routes/managementRoutes");
const companyRoutes = require("./routes/companyRoutes");
const placementDriveRoutes = require("./routes/placementDriveRoutes");
const placementApplicationRoutes = require("./routes/placementApplicationRoutes");
const offerRoutes = require("./routes/offerRoutes");
const jobPostingRoutes = require("./routes/jobPostingRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const studentSkillRoutes = require("./routes/studentSkillRoutes");
const studentProjectRoutes = require("./routes/studentProjectRoutes");
const studentCertificationRoutes = require("./routes/studentCertificationRoutes");
const studentPhaseAllocationRoutes = require("./routes/studentPhaseAllocationRoutes");
const trainingPhaseRoutes = require("./routes/trainingPhaseRoutes");
const phaseBatchRoutes = require("./routes/phaseBatchRoutes");
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const assessmentRoutes = require("./routes/assesmentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const managementProfileRoutes = require("./routes/managementProfileRoutes");
const placementTeamProfileRoutes = require("./routes/placementTeamProfileRoutes");
const systemPermissionRoutes = require("./routes/systemPermissionRoutes");
const rolePermissionMappingRoutes = require("./routes/rolePermissionMappingRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationLogRoutes = require("./routes/notificationLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ==========================
// Express App Initialization
// ==========================
const app = express();

// ==========================
// Global Middleware Stack
// ==========================
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Assets Hosting
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// Base Health Check Route
// ==========================
app.get("/", (req, res) => {
    res.send("TP Portal Enterprise Backend Running...");
});

// ==========================
// Route Mounts
// ==========================
app.use("/api/auth", authRbacRoutes);
app.use("/api/admin/rbac", adminRbacRoutes);
app.use("/api/auth", authRoutes);

// 💡 Mounted /api/user routes to fix RightsContext fetch /api/user/rights 404 error
app.use("/api/user", userRoutes);

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRbacManagementRoutes); // Provides /api/admin/rbac-matrix and /api/admin/update-role-permissions

app.use("/api/student", studentRoutes);
app.use("/api/placement-officer", placementOfficerRoutes);
app.use("/api/placement-coordinator", placementCoordinatorRoutes);
app.use("/api/placement-head", placementHeadRoutes);
app.use("/api/training-head", trainingHeadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/management", managementRoutes);

app.use("/api/companies", companyRoutes);

// Flexible Dual-Mounting for Placement Routes
app.use("/api/placement", placementDriveRoutes);
app.use("/api/placement-drives", placementDriveRoutes);

app.use("/api/placement-applications", placementApplicationRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/job-postings", jobPostingRoutes);

app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/student-skills", studentSkillRoutes);
app.use("/api/student-projects", studentProjectRoutes);
app.use("/api/student-certifications", studentCertificationRoutes);
app.use("/api/student-phase-allocations", studentPhaseAllocationRoutes);
app.use("/api/training-phases", trainingPhaseRoutes);
app.use("/api/phase-batches", phaseBatchRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/placement-team-profiles", placementTeamProfileRoutes);
app.use("/api/management-profiles", managementProfileRoutes);
app.use("/api/system-permissions", systemPermissionRoutes);
app.use("/api/role-permissions", rolePermissionMappingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notification-logs", notificationLogRoutes);
app.use("/api/notifications", notificationRoutes);

// ==========================
// Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error("Unhandled error encountered:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ==========================
// Server Listener
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});