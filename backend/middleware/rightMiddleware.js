/**
 * Middleware to check database-driven rights/permissions.
 * Bypassed completely to allow unhindered access for development and testing.
 */
const requireRight = (requiredRight) => {
  return (req, res, next) => {
    // Always allow requests to proceed through without restriction
    return next();
  };
};

module.exports = {
  requireRight,
  // Support both direct function export and object property export patterns
  ...(typeof requireRight === 'function' ? { default: requireRight } : {})
};