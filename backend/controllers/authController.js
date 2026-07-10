const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Test Endpoint
exports.test = (req, res) => {
    res.json({
        success: true,
        message: "Auth Controller Working"
    });
};

// ==========================================
// REGISTER PIPELINE WITH COOKIE GENERATION
// ==========================================
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
        
        // Assuming createUser returns the complete newly initialized database entry row object
        const newUser = await userModel.createUser(email, passwordHash, role);

        // Optional: Generate a token instantly upon successful registration to match standard DX architectures
        const token = jwt.sign(
            { id: newUser.id || user.id, role: role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send token as a cookie right away
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to false for HTTP local environment development tracking
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24-hour lifetime duration map
        });

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

// ==========================================
// LOGIN PIPELINE WITH SECURE COOKIE DROPPING
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Incoming Login Payload Context: ", req.body);

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

        // FIXED: Dropping the authentication token into a cookie wrapper node before JSON execution
        res.cookie('token', token, {
            httpOnly: true,     // Block XSS token parsing access vectors
            secure: false,      // Set to false for HTTP localhost ports development (Chrome blocks secure cookies on HTTP)
            sameSite: 'lax',    // Enables cookie cross-origin mapping parameters locally
            maxAge: 24 * 60 * 60 * 1000 // 1 complete cycle day tracking lifecycle context
        });

        // Send response down the pipeline
        res.status(200).json({
            success: true,
            message: "Login Successful",
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

// ==========================================================================
// SESSION STABILIZATION HANDSHAKE ENGINE
// ==========================================================================
exports.me = async (req, res) => {
    try {
        // req.user is populated dynamically by your verifyToken middleware layout
        const userId = req.user.id; 

        // Query the database to pull the student context details
        const user = await userModel.findById(userId); // Or your matching ID finder query method

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Session context has expired or user database row dropped."
            });
        }

        // Return the exact properties your AuthContext and Guard loops depend on!
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                // Include standard student profile parameters if already populated
                branch: user.branch,
                cgpa: user.cgpa,
                phone_number: user.phone_number
            }
        });

    } catch (error) {
        console.error("Session verification handshake exception:", error);
        return res.status(500).json({
            success: false,
            message: "Internal token resolution runtime fault."
        });
    }
};