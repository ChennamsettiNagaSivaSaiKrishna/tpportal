const companyModel = require("../models/companyModel");

// ===============================
// Add Company
// ===============================
exports.addCompany = async (req, res) => {
    try {

        const {
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        } = req.body;

        if (!company_name || !company_lpa) {
            return res.status(400).json({
                success: false,
                message: "Company name and LPA are required"
            });
        }

        await companyModel.addCompany(
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        );

        res.status(201).json({
            success: true,
            message: "Company added successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ===============================
// Get All Companies
// ===============================
exports.getAllCompanies = async (req, res) => {

    try {

        const companies = await companyModel.getAllCompanies();

        res.json({
            success: true,
            companies
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ===============================
// Get Company By ID
// ===============================
exports.getCompanyById = async (req, res) => {

    try {

        const company = await companyModel.getCompanyById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        res.json({
            success: true,
            company
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ===============================
// Update Company
// ===============================
exports.updateCompany = async (req, res) => {

    try {

        const {
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        } = req.body;

        await companyModel.updateCompany(
            req.params.id,
            company_name,
            company_lpa,
            company_location,
            is_msme,
            is_product_based,
            is_internship
        );

        res.json({
            success: true,
            message: "Company updated successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// ===============================
// Delete Company
// ===============================
exports.deleteCompany = async (req, res) => {

    try {

        await companyModel.deleteCompany(req.params.id);

        res.json({
            success: true,
            message: "Company deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};