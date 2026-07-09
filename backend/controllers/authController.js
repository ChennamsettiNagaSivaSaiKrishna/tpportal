const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

// Test
exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Auth Controller Working"
    });
};

// Register
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await userModel.findByEmail(email);

        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await userModel.createUser(email, passwordHash, role);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
const jwt = require("jsonwebtoken");

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            role: user.role
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};