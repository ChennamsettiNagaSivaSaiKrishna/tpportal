const studentCertificationModel = require("../models/studentCertificationModel");

// ======================================
// Add Certification
// ======================================
exports.addCertification = async (req, res) => {

    try {

        const {
            student_roll,
            certification_name,
            issuing_organization,
            credential_url
        } = req.body;

        if (
            !student_roll ||
            !certification_name ||
            !issuing_organization
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        await studentCertificationModel.addCertification(
            student_roll,
            certification_name,
            issuing_organization,
            credential_url
        );

        res.status(201).json({
            success: true,
            message: "Certification Added Successfully"
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
// Get Student Certifications
// ======================================
exports.getStudentCertifications = async (req, res) => {

    try {

        const certifications =
            await studentCertificationModel.getStudentCertifications(
                req.params.student_roll
            );

        res.json({
            success: true,
            certifications
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
// Get All Certifications
// ======================================
exports.getAllCertifications = async (req, res) => {

    try {

        const certifications =
            await studentCertificationModel.getAllCertifications();

        res.json({
            success: true,
            certifications
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
// Update Certification
// ======================================
exports.updateCertification = async (req, res) => {

    try {

        const {
            certification_name,
            issuing_organization,
            credential_url
        } = req.body;

        await studentCertificationModel.updateCertification(
            req.params.id,
            certification_name,
            issuing_organization,
            credential_url
        );

        res.json({
            success: true,
            message: "Certification Updated Successfully"
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
// Delete Certification
// ======================================
exports.deleteCertification = async (req, res) => {

    try {

        await studentCertificationModel.deleteCertification(
            req.params.id
        );

        res.json({
            success: true,
            message: "Certification Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};