const express = require("express");
const router = express.Router();

const companyController = require("../controllers/companyController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// ===============================
// Add Company
// ===============================
router.post(
    "/",
    verifyToken,
    verifyRole("placement_officer"),
    companyController.addCompany
);

// ===============================
// Get All Companies
// ===============================
router.get(
    "/",
    verifyToken,
    companyController.getAllCompanies
);

// ===============================
// Get Company By ID
// ===============================
router.get(
    "/:id",
    verifyToken,
    companyController.getCompanyById
);

// ===============================
// Update Company
// ===============================
router.put(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    companyController.updateCompany
);

// ===============================
// Delete Company
// ===============================
router.delete(
    "/:id",
    verifyToken,
    verifyRole("placement_officer"),
    companyController.deleteCompany
);

module.exports = router;