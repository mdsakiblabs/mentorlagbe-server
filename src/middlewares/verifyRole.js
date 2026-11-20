const verifyRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login first.",
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to access this resource.",
      });
    }

    next();
  };
};

export const verifyStudent = verifyRole("student");
export const verifyTutor = verifyRole("tutor");
export const verifyAdmin = verifyRole("admin");
