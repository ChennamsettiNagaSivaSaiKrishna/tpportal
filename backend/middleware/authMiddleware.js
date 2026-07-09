const jwt = require("jsonwebtoken");

// ===============================
// Verify JWT Token
// ===============================
exports.verifyToken = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. Token Missing."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("========== TOKEN ==========");
        console.log(decoded);
        console.log("===========================");

        req.user = decoded;

        next();

    } catch (err) {

        console.log(err);

        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });

    }
};

// ===============================
// Verify User Role
// ===============================
exports.verifyRole = (...roles) => {

    return (req, res, next) => {

        console.log("Required Roles :", roles);
        console.log("Logged User Role :", req.user.role);

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: "Access Forbidden",
                yourRole: req.user.role,
                requiredRole: roles
            });

        }

        next();

    };

};