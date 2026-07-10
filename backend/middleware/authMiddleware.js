const jwt = require("jsonwebtoken");

// ==========================================================================
// HIGH-SECURITY MULTI-SOURCE JWT VERIFIER (COOKIES + HEADERS)
// ==========================================================================
exports.verifyToken = (req, res, next) => {
    try {
        let token = null;

        // 1. PRIMARY SOURCE: Attempt extraction from secure HttpOnly cookies parsed by cookieParser
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } 
        // 2. FALLBACK SOURCE: Attempt extraction from traditional Authorization headers if present
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 3. ENFORCEMENT FILTER: If neither source yielded a token, deny workspace access instantly
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. Token Missing."
            });
        }

        // Validate extraction payloads against structural environmental secrets
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("========== TOKEN SYSTEM SIGNALS ==========");
        console.log("Extraction Pipeline Source Validated Successfully.");
        console.log(decoded);
        console.log("==========================================");

        // Inject active session context parameter map down the middleware stack
        req.user = decoded;

        next();

    } catch (err) {
        console.log("Authentication Exception Captured:", err.message);

        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }
};

// ==========================================================================
// STRICT WORKSPACE ROLE VERIFIER
// ==========================================================================
exports.verifyRole = (...roles) => {
    return (req, res, next) => {
        console.log("Required Roles :", roles);
        console.log("Logged User Role :", req.user?.role);

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden",
                yourRole: req.user ? req.user.role : "None",
                requiredRole: roles
            });
        }

        next();
    };
};