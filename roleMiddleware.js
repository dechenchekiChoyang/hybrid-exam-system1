/**
 * Role-Based Authorization Middleware
 * Usage:
 *   authorize("student")
 *   authorize("instructor")
 *   authorize("department-admin")
 *   authorize("super-admin")
 */

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't have permission to access this resource.",
      });
    }

    next();
  };
};