const adminModel = require("../models/adminModel");

exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Admin Controller Working"
    });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await adminModel.getAllUsers();

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};