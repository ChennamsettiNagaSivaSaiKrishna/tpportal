const departmentModel = require("../models/departmentModel");

// ======================================
// Add Department
// ======================================
exports.addDepartment = async (req, res) => {
    try {

        const {
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        } = req.body;

        await departmentModel.addDepartment(
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        );

        res.status(201).json({
            success: true,
            message: "Department Added Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get All Departments
// ======================================
exports.getAllDepartments = async (req, res) => {
    try {

        const departments =
            await departmentModel.getAllDepartments();

        res.json({
            success: true,
            departments
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Get Department By ID
// ======================================
exports.getDepartmentById = async (req, res) => {
    try {

        const department =
            await departmentModel.getDepartmentById(
                req.params.id
            );

        res.json({
            success: true,
            department
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Update Department
// ======================================
exports.updateDepartment = async (req, res) => {
    try {

        const {
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        } = req.body;

        await departmentModel.updateDepartment(
            req.params.id,
            dept_name,
            dept_full_name,
            hod_user_id,
            dept_mobile,
            dept_email
        );

        res.json({
            success: true,
            message: "Department Updated Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// ======================================
// Delete Department
// ======================================
exports.deleteDepartment = async (req, res) => {
    try {

        await departmentModel.deleteDepartment(
            req.params.id
        );

        res.json({
            success: true,
            message: "Department Deleted Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};