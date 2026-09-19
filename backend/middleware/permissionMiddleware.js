const db = require('../config/db');

/**
 * Database-driven permission verification middleware.
 * Verifies that the authenticated user's role has the required permission key
 * in the system_permissions & role_permissions_mapping tables.
 * 
 * @param {string} requiredPermission - The permission key to verify (e.g. 'TRAINING_PHASE_CREATE')
 */
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Verify user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. No authenticated identity found.'
        });
      }

      const userRole = String(req.user.role).trim().toLowerCase();

      // 2. Superuser bypass for system administrator
      if (userRole === 'admin') {
        return next();
      }

      // 3. Query role_permissions_mapping JOIN system_permissions
      const query = `
        SELECT sp.permission_key
        FROM role_permissions_mapping rpm
        JOIN system_permissions sp ON rpm.permission_id = sp.id
        WHERE LOWER(rpm.role) = ? AND sp.permission_key = ?
        LIMIT 1
      `;
      const [rows] = await db.query(query, [userRole, requiredPermission]);

      // 4. Check if permission exists for user's role
      if (rows && rows.length > 0) {
        return next();
      }

      // 5. Permission denied
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role '${req.user.role}' lacks the required permission: ${requiredPermission}`
      });
    } catch (error) {
      console.error(`[RBAC] Permission check error for '${requiredPermission}':`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal authorization evaluation error.',
        error: error.message
      });
    }
  };
};

module.exports = {
  requirePermission
};
