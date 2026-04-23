/**
 * Middleware to check if user has required permission
 * Admin users bypass all permission checks
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        const user = req.user;

        // Admin has all permissions
        if (user.userType === "admin") {
            return next();
        }

        // Check if user has the required permission
        if (user.permissions && user.permissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access denied. You don't have permission for this action.",
        });
    };
};

/**
 * Middleware to check if user has any of the listed permissions
 */
export const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        const user = req.user;

        if (user.userType === "admin") {
            return next();
        }

        const hasPermission = permissions.some((p) => user.permissions?.includes(p));

        if (hasPermission) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access denied. You don't have permission for this action.",
        });
    };
};