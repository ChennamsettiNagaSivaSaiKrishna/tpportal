const { requirePermission } = require('./permissionMiddleware');

/**
 * Backward-compatible bridge from legacy rightMiddleware to database-driven requirePermission.
 */
const requireRight = (requiredRight) => {
  return requirePermission(requiredRight);
};

module.exports = {
  requireRight,
  requirePermission,
  default: requireRight
};