const express = require("express");

const router = express.Router();

const jobPostingController = require("../controllers/jobPostingController");

const {
    verifyToken,
    verifyRole
} = require("../middleware/authMiddleware");

console.log("✅ JOB POSTING ROUTES LOADED");

// ======================================
// Add Job Posting
// ======================================
router.post(
    "/",
    (req, res, next) => {
        console.log("✅ POST /api/job-postings HIT");
        next();
    },
    verifyToken,
    verifyRole("placement_officer"),
    jobPostingController.addJobPosting
);

// ======================================
// Get All Job Postings
// ======================================
router.get(
    "/",
    (req, res, next) => {
        console.log("✅ GET /api/job-postings HIT");
        next();
    },
    verifyToken,
    jobPostingController.getAllJobPostings
);

// ======================================
// Get Job Posting By ID
// ======================================
router.get(
    "/:id",
    verifyToken,
    jobPostingController.getJobPostingById
);

// ======================================
// Update Job Posting
// ======================================
router.put(
    "/:id",
    (req, res, next) => {
        console.log("✅ PUT /api/job-postings HIT");
        next();
    },
    verifyToken,
    verifyRole("placement_officer"),
    jobPostingController.updateJobPosting
);

// ======================================
// Delete Job Posting
// ======================================
router.delete(
    "/:id",
    (req, res, next) => {
        console.log("✅ DELETE /api/job-postings HIT");
        next();
    },
    verifyToken,
    verifyRole("placement_officer"),
    jobPostingController.deleteJobPosting
);

module.exports = router;