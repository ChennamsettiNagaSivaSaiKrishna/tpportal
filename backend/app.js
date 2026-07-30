const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// ==========================
// Route Imports
// ==========================
// 🔐 RBAC Dynamic Permission Routes
const authRbacRoutes = require("./routes/authRbacRoutes");
const adminRbacRoutes = require("./routes/adminRbacRoutes");

// Core Auth & Standard Admin Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

// User Role Specific Routes
const studentRoutes = require("./routes/studentRoutes");
const placementOfficerRoutes = require("./routes/placementOfficerRoutes");
const placementCoordinatorRoutes = require("./routes/placementCoordinatorRoutes");
const placementHeadRoutes = require("./routes/placementHeadRoutes");
const trainingHeadRoutes = require("./routes/trainingHeadRoutes");
const hodRoutes = require("./routes/hodRoutes");
const managementRoutes = require("./routes/managementRoutes");

// Placement & Corporate Modules
const companyRoutes = require("./routes/companyRoutes");
const placementDriveRoutes = require("./routes/placementDriveRoutes");
const placementApplicationRoutes = require("./routes/placementApplicationRoutes");
const offerRoutes = require("./routes/offerRoutes");
const jobPostingRoutes = require("./routes/jobPostingRoutes");

// Student Portfolio Modules
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const studentSkillRoutes = require("./routes/studentSkillRoutes");
const studentProjectRoutes = require("./routes/studentProjectRoutes");
const studentCertificationRoutes = require("./routes/studentCertificationRoutes");
const studentPhaseAllocationRoutes = require("./routes/studentPhaseAllocationRoutes");

// Training & Attendance Engine Modules
const trainingPhaseRoutes = require("./routes/trainingPhaseRoutes");
const phaseBatchRoutes = require("./routes/phaseBatchRoutes");
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const assessmentRoutes = require("./routes/assesmentRoutes");

// Organization & Profile Settings
const departmentRoutes = require("./routes/departmentRoutes");
const managementProfileRoutes = require("./routes/managementProfileRoutes");
const placementTeamProfileRoutes = require("./routes/placementTeamProfileRoutes");
const systemPermissionRoutes = require("./routes/systemPermissionRoutes");
const rolePermissionMappingRoutes = require("./routes/rolePermissionMappingRoutes");

// Communications & Announcements Modules
const announcementRoutes = require("./routes/announcementRoutes");
const notificationLogRoutes = require("./routes/notificationLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userNotificationRoutes = require("./routes/userNotificationRoutes");

// ==========================
// Express App Initialization
// ==========================
const app = express();

// ==========================
// Global Middleware Stack
// ==========================
app.use(cors({
    origin: "http://localhost:3000", // Explicitly trust React local port
    credentials: true,               // Allows backend to read/write HttpOnly session cookies
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
// 🔐 Dynamic RBAC Core API Routes
// ==========================
app.use("/api/auth", authRbacRoutes);       // Exports /api/auth/getPageRights
app.use("/api/admin/rbac", adminRbacRoutes); // Exports Admin Suite Rights/Groups CRUD

// ==========================
// Authentication & Users
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ==========================
// Role Specific Portals
// ==========================
app.use("/api/student", studentRoutes);
app.use("/api/placement-officer", placementOfficerRoutes);
app.use("/api/placement-coordinator", placementCoordinatorRoutes);
app.use("/api/placement-head", placementHeadRoutes);
app.use("/api/training-head", trainingHeadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/management", managementRoutes);

// ==========================
// Placement & Corporate Modules
// ==========================
app.use("/api/companies", companyRoutes);
app.use("/api/placement-drives", placementDriveRoutes);
app.use("/api/placement-applications", placementApplicationRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/job-postings", jobPostingRoutes);

// ==========================
// Student Portfolio Modules
// ==========================
app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/student-skills", studentSkillRoutes);
app.use("/api/student-projects", studentProjectRoutes);
app.use("/api/student-certifications", studentCertificationRoutes);
app.use("/api/student-phase-allocations", studentPhaseAllocationRoutes);

// ==========================
// Training & Assessment Modules
// ==========================
app.use("/api/training-phases", trainingPhaseRoutes);
app.use("/api/phase-batches", phaseBatchRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assessment", assessmentRoutes);

// ==========================
// Organization & Permissions
// ==========================
app.use("/api/departments", departmentRoutes);
app.use("/api/placement-team-profiles", placementTeamProfileRoutes);
app.use("/api/management-profiles", managementProfileRoutes);
app.use("/api/system-permissions", systemPermissionRoutes);
app.use("/api/role-permissions", rolePermissionMappingRoutes);

// ==========================
// Communication Hub
// ==========================
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

module.exports = app;